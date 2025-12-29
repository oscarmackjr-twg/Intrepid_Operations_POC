from __future__ import annotations
import pandas as pd
from pipeline.normalize import normalize_columns, parse_dates, validate_required


def load_tape(tape_csv_path: str) -> pd.DataFrame:
    """
    Load Tape20Loans (or equivalent) CSV.
    Expected to contain seller_loan_no and status_codes (or variants).
    """
    df = pd.read_csv(tape_csv_path)
    df = normalize_columns(df)
    df = df.rename(columns={"Account Number": "seller_loan_no"})
    df["seller_loan_no"] = df["seller_loan_no"].astype(str).str.strip()
    validate_required(df, ["seller_loan_no", "status_codes"], "tape.load_tape")
    return df


def tag_repurchases(tape_df: pd.DataFrame) -> pd.DataFrame:
    """
    Notebook parity (skeleton):
    - repurchased = True if status_codes contains 'REPURCHASE' (case-insensitive).
    - repurchase_date if available (optional).
    """
    df = tape_df.copy()
    df["status_codes"] = df["status_codes"].astype("string")

    df["repurchased"] = df["status_codes"].str.upper().str.contains("REPURCHASE", na=False)

    # If repurchase_date exists in tape, normalize it; otherwise leave NaT/None.
    if "repurchase_date" in df.columns:
        df = parse_dates(df, ["repurchase_date"])

    # Keep only what we need to merge back
    cols = ["seller_loan_no", "repurchased"]
    if "repurchase_date" in df.columns:
        cols.append("repurchase_date")

    return df[cols].drop_duplicates(subset=["seller_loan_no"])


def apply_repurchases(df: pd.DataFrame, rep: pd.DataFrame) -> pd.DataFrame:
    # Make sure both sides have the same key name, if needed
    if "seller_loan_no" not in rep.columns:
        rep = rep.rename(columns={
            "Account Number": "seller_loan_no",
            "account number": "seller_loan_no",
            # add any other variant you know about here
        })

    # Force both merge keys to be strings
    df["seller_loan_no"] = df["seller_loan_no"].astype(str).str.strip()
    rep["seller_loan_no"] = rep["seller_loan_no"].astype(str).str.strip()

    merged = df.merge(rep, on="seller_loan_no", how="left")

    # If rep has a repurchased flag, normalize it
    if "repurchased" in merged.columns:
        merged["repurchased"] = merged["repurchased"].fillna(False).astype(bool)

    return merged

