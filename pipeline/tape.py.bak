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


def apply_repurchases(loans_df: pd.DataFrame, rep_df: pd.DataFrame) -> pd.DataFrame:
    """
    Left-merge repurchase flags into loans_df.
    """
    df = loans_df.copy()
    df = normalize_columns(df)

    rep = rep_df.copy()
    rep = normalize_columns(rep)

    validate_required(df, ["seller_loan_no"], "tape.apply_repurchases.loans")
    validate_required(rep, ["seller_loan_no", "repurchased"], "tape.apply_repurchases.rep")

    df = df.merge(rep, on="seller_loan_no", how="left")
    df["repurchased"] = df["repurchased"].fillna(False)

    return df
