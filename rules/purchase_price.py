import pandas as pd
from decimal import Decimal


def purchase_price_rule(df: pd.DataFrame, rule_cfg: dict) -> pd.DataFrame:
    """
    Validates lender price vs modeled purchase price.

    Expected df columns (snake_case):
      - seller_loan_no
      - lender_price_pct
      - modeled_purchase_price   (decimal dollars; will be converted to %)
      - original_balance         (optional for output)
      - purchase_price           (optional for output)

    rule_cfg keys:
      - rule_id
      - severity
      - tolerance_bps   (basis points; 1 bp = 0.01%)
    """

    required = ["seller_loan_no", "lender_price_pct", "modeled_purchase_price"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise KeyError(
            f"purchase_price_rule missing required column(s): {missing}. "
            f"Columns present: {list(df.columns)}"
        )

    # tolerance in basis points (bps): 1 bp = 0.01% => divide by 10000 to get percent points
    tolerance_bps = Decimal(str(rule_cfg["tolerance_bps"]))
    tolerance_pct_points = tolerance_bps / Decimal("10000")

    # modeled_purchase_price is in dollars; convert to percentage points of par
    # if modeled_purchase_price is already a percent, remove the *100 below.
    expected_price_pct = (
        df["modeled_purchase_price"]
        .astype(float)
        .mul(100.0)
        .round(2)
    )

    actual_price_pct = df["lender_price_pct"].astype(float).round(2)
    price_diff = (actual_price_pct - expected_price_pct).abs()

    failed = price_diff > float(tolerance_pct_points)

    exceptions = df.loc[failed].copy()
    if exceptions.empty:
        return pd.DataFrame()

    exceptions["rule_id"] = rule_cfg["rule_id"]
    exceptions["exception_type"] = "PURCHASE_PRICE"
    exceptions["severity"] = rule_cfg["severity"]
    exceptions["expected_value"] = expected_price_pct.loc[failed]
    exceptions["actual_value"] = actual_price_pct.loc[failed]
    exceptions["difference"] = price_diff.loc[failed]

    # Output columns: snake_case
    output_cols = [
        "seller_loan_no",
        "rule_id",
        "exception_type",
        "severity",
        "expected_value",
        "actual_value",
        "difference",
    ]

    # include if present (don’t crash if pipeline hasn’t added them yet)
    for optional in ["original_balance", "purchase_price"]:
        if optional in exceptions.columns:
            output_cols.append(optional)

    return exceptions[output_cols]
