from __future__ import annotations
import pandas as pd


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize common inbound column variants into canonical snake_case.
    Keep it conservative: only rename known variants.
    """
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]

    rename_map = {
        "SELLER Loan #": "seller_loan_no",
        "Seller Loan #": "seller_loan_no",
        "Seller Loan No": "seller_loan_no",
        "Platform": "platform",
        "Loan Program": "loan_program",
        "loan program": "loan_program",
        "Submit Date": "submit_date",
        "submit date": "submit_date",
        "FICO": "fico",
        "FICO Borrower": "fico",
        "Application Type": "application_type",
        "Lender Price(%)": "lender_price_pct",
        "Purchase Price": "purchase_price",
        "Original Balance": "original_balance",
        "Current Balance": "current_balance",
        "State": "state",
        "Status Codes": "status_codes",
        "Repurchased": "repurchased",
        "Repurchase_Date": "repurchase_date",
        "Repurchase Date": "repurchase_date",
        "Purchase_Date": "purchase_date",
        "Purchase Date": "purchase_date",
    }

    present = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=present)
    return df


def parse_dates(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """
    Parse specified date columns into python datetime.date.
    """
    df = df.copy()
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce").dt.date
    return df


def validate_required(df: pd.DataFrame, required: list[str], stage: str) -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise KeyError(
            f"[{stage}] Missing required columns: {missing}. "
            f"Columns present: {list(df.columns)}"
        )
