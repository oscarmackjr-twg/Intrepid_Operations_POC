# rules/eligibility.py

import pandas as pd


def _to_snake(s: str) -> str:
    return (
        str(s).strip().lower()
        .replace("%", "pct")
        .replace(".", "")
        .replace("(", "")
        .replace(")", "")
        .replace("/", "_")
        .replace("-", "_")
        .replace(" ", "_")
    )


def _normalize_balance_column(raw: str) -> str:
    """
    Map DB-stored human labels (e.g. 'Orig. Balance') to canonical snake_case columns.
    """
    s = _to_snake(raw)

    # Common aliases coming from rule_eligibility_config.balance_column
    if s in ("orig_balance", "orig_balance_", "orig__balance", "orig_balance__"):
        return "original_balance"
    if s == "purchase_price":
        return "purchase_price"
    if s == "current_balance":
        return "current_balance"

    # Fallback: return normalized name
    return s


def eligibility_rules(df: pd.DataFrame, rules_cfg: pd.DataFrame) -> pd.DataFrame:
    """
    Portfolio-level eligibility ratio checks.

    Expected df columns (snake_case):
      - platform
      - loan_type      (derived in build_dataset; e.g. 'standard', 'hybrid', 'ninp', 'unknown')
      - term           (optional, for term rules)
      - fico           (optional, for fico rules)
      - original_balance / purchase_price / current_balance (depending on config)

    rules_cfg expected columns (from rule_eligibility_config):
      - rule_id, platform, loan_type, max_term, min_term, fico_threshold,
        max_ratio, balance_column, enabled, severity
    """
    if rules_cfg is None or rules_cfg.empty:
        return pd.DataFrame()

    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]

    if "platform" not in df.columns:
        raise KeyError("eligibility_rules requires df['platform']")

    exceptions = []

    for _, rule in rules_cfg.iterrows():
        # Honor enabled flag if present
        if "enabled" in rule and not bool(rule["enabled"]):
            continue

        rule_id = rule.get("rule_id")
        platform = rule.get("platform")
        if pd.isna(platform) or str(platform).strip() == "":
            continue

        scope = df[df["platform"] == platform].copy()
        if scope.empty:
            continue

        # Loan type filter (config loan_type is like 'standard', 'hybrid', etc.)
        loan_type = rule.get("loan_type")
        if pd.notna(loan_type) and str(loan_type).strip() != "":
            if "loan_type" not in scope.columns:
                raise KeyError(
                    f"Eligibility rule {rule_id} requires df['loan_type'] but it's missing. "
                    f"Add loan_type derivation in build_dataset."
                )
            scope = scope[scope["loan_type"] == str(loan_type).strip().lower()]

        # Term filters
        max_term = rule.get("max_term")
        min_term = rule.get("min_term")

        # Compatibility shim: some seed data used min_term for TERM_LE_ rules.
        if pd.isna(max_term) and pd.notna(min_term):
            rid = str(rule_id or "")
            if "TERM_LE_" in rid:
                max_term = min_term
                min_term = None

        if pd.notna(min_term):
            if "term" not in scope.columns:
                raise KeyError(f"Eligibility rule {rule_id} uses term but df['term'] is missing.")
            scope = scope[scope["term"] >= int(min_term)]

        if pd.notna(max_term):
            if "term" not in scope.columns:
                raise KeyError(f"Eligibility rule {rule_id} uses term but df['term'] is missing.")
            scope = scope[scope["term"] <= int(max_term)]

        # FICO threshold filter
        fico_threshold = rule.get("fico_threshold")
        if pd.notna(fico_threshold):
            if "fico" not in scope.columns:
                raise KeyError(f"Eligibility rule {rule_id} uses fico but df['fico'] is missing.")
            scope = scope[scope["fico"] < float(fico_threshold)]

        # Balance column (from config: e.g. 'Orig. Balance')
        bal_raw = rule.get("balance_column")
        if pd.isna(bal_raw) or str(bal_raw).strip() == "":
            raise ValueError(f"Eligibility rule {rule_id} missing balance_column")

        balance_col = _normalize_balance_column(str(bal_raw))

        if balance_col not in df.columns:
            raise KeyError(
                f"Eligibility rule {rule_id} balance_column='{bal_raw}' "
                f"(normalized to '{balance_col}') not found in df. Columns: {list(df.columns)}"
            )

        numerator = scope[balance_col].fillna(0).sum()
        denominator = df[df["platform"] == platform][balance_col].fillna(0).sum()

        if denominator == 0:
            continue

        ratio = float(numerator) / float(denominator)
        max_ratio = rule.get("max_ratio")
        if pd.isna(max_ratio):
            continue

        if ratio > float(max_ratio):
            exceptions.append(
                {
                    "rule_id": rule_id,
                    "exception_type": "ELIGIBILITY_RATIO",
                    "platform": platform,
                    "severity": rule.get("severity"),
                    "actual_value": round(ratio, 4),
                    "expected_value": float(max_ratio),
                    "difference": round(ratio - float(max_ratio), 4),
                    "balance_impact": float(numerator),
                    "balance_column": balance_col,
                }
            )

    return pd.DataFrame(exceptions)
