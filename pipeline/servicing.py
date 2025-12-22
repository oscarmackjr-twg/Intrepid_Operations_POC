from __future__ import annotations
from datetime import date
import pandas as pd

from pipeline.normalize import normalize_columns, parse_dates, validate_required


def load_fx_trial_balance(fx3_path: str, fx4_path: str) -> pd.DataFrame:
    """
    Skeleton loader: assumes fx3/fx4 are CSVs with loan id + balance fields.
    If they are Excel, swap pd.read_csv -> pd.read_excel accordingly.
    """
    fx3 = pd.read_csv(fx3_path)
    fx4 = pd.read_csv(fx4_path)

    fx3 = normalize_columns(fx3)
    fx4 = normalize_columns(fx4)

    # Minimal: concatenate and keep canonical fields if present.
    svc = pd.concat([fx3, fx4], ignore_index=True)

    # Expect at least seller_loan_no + current_balance (or original/current variants)
    validate_required(svc, ["seller_loan_no"], "servicing.load_fx_trial_balance")

    # Normalize dates if present
    svc = parse_dates(svc, ["purchase_date", "repurchase_date"])

    return svc


def reconcile_servicing(
    loans_df: pd.DataFrame,
    servicing_df: pd.DataFrame,
    *,
    cutoff_date: date,
) -> dict[str, pd.DataFrame]:
    """
    Skeleton reconciliation producing buckets:
      - still_exist: in loans and servicing
      - paid: in loans but not in servicing (placeholder logic)
      - rest: in servicing but not in loans (placeholder logic)
      - check_final_df: loans enriched with servicing balances (best-effort)

    NOTE: Notebook logic is richer (paid/rest definitions, current purchase price calc, etc.).
    This skeleton gets the structure right so the pipeline runs end-to-end.
    """
    loans = normalize_columns(loans_df.copy())
    svc = normalize_columns(servicing_df.copy())

    validate_required(loans, ["seller_loan_no"], "servicing.reconcile_servicing.loans")
    validate_required(svc, ["seller_loan_no"], "servicing.reconcile_servicing.servicing")

    # If servicing has a balance column, use it; otherwise create placeholder.
    if "current_balance" not in svc.columns:
        svc["current_balance"] = pd.NA

    # Create a canonical servicing subset to merge
    svc_sub = svc[["seller_loan_no", "current_balance"]].drop_duplicates(subset=["seller_loan_no"])

    merged = loans.merge(svc_sub, on="seller_loan_no", how="left", suffixes=("", "_svc"))

    still_exist = merged[merged["current_balance"].notna()].copy()
    paid = merged[merged["current_balance"].isna()].copy()

    # "rest" = servicing loans not in loans_df
    rest = svc_sub[~svc_sub["seller_loan_no"].isin(loans["seller_loan_no"])].copy()

    # Apply repurchase override if flag exists
    if "repurchased" in merged.columns:
        rep_mask = merged["repurchased"] == True
        if "current_balance" in merged.columns:
            merged.loc[rep_mask, "current_balance"] = 0

        if "purchase_price" in merged.columns:
            merged.loc[rep_mask, "purchase_price"] = 0

    return {
        "still_exist": still_exist,
        "paid": paid,
        "rest": rest,
        "check_final_df": merged,
    }
