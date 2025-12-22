from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

import os
import argparse
from datetime import datetime

import pandas as pd
from sqlalchemy import create_engine

from rules.engine import run_comap_rules
from rules.config_loader import load_comap_config


def _require_venv():
    if os.environ.get("VIRTUAL_ENV") is None:
        raise RuntimeError(
            "Virtual environment is not activated. "
            "Activate your venv before running the engine."
        )


def _normalize_input_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    rules/comap.py expects lowercase column names like:
      platform, loan_program, fico, submit_date
    But Exhibit A / your CSVs often use Title Case names.
    Normalize only the key columns (safe, minimal).
    """
    # Strip whitespace from headers first (common in Excel-derived CSVs)
    df.columns = [str(c).strip() for c in df.columns]

    rename_map = {
        "Platform": "platform",
        "Loan Program": "loan_program",
        "FICO": "fico",
        "Submit Date": "submit_date",
        "SELLER Loan #": "seller_loan_no",
        "Seller Loan #": "seller_loan_no",
        "Seller Loan No": "seller_loan_no",
    }

    # Apply only those present
    present_map = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(columns=present_map)

    # Validate required columns for CoMAP early with a clear error
    required = ["platform", "loan_program", "fico", "submit_date"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise KeyError(
            f"Input CSV is missing required column(s) for CoMAP: {missing}. "
            f"Columns present: {list(df.columns)}"
        )

    return df


def _parse_submit_date(df: pd.DataFrame) -> pd.DataFrame:
    """
    CoMAP compares submit_date against datetime.date cutoffs.
    Ensure it's a python date (not a string, not a Timestamp).
    """
    if "submit_date" not in df.columns:
        raise KeyError("Input data is missing required column: 'submit_date'")

    df["submit_date"] = pd.to_datetime(df["submit_date"], errors="raise").dt.date
    return df


def _rename_for_db(exceptions_df: pd.DataFrame) -> pd.DataFrame:
    """
    Keep your previous behavior, but extend it to handle both possible names.
    """
    if "SELLER Loan #" in exceptions_df.columns:
        exceptions_df = exceptions_df.rename(columns={"SELLER Loan #": "seller_loan_no"})
    if "Seller Loan #" in exceptions_df.columns:
        exceptions_df = exceptions_df.rename(columns={"Seller Loan #": "seller_loan_no"})
    return exceptions_df


def parse_args():
    p = argparse.ArgumentParser(description="Loan rules engine runner")

    p.add_argument("--run-id", required=True, help="Unique run identifier (e.g. TEST_RUN_001)")
    p.add_argument(
        "--input-csv",
        required=True,
        help="Path to the prepared engine input CSV (e.g. outputs/engine_input.csv)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Run rules but do not write exceptions to the database",
    )

    p.add_argument(
        "--db-url",
        default=os.environ.get("LOAN_ENGINE_DB_URL", "postgresql://localhost/loan_test"),
        help="SQLAlchemy database URL (or set LOAN_ENGINE_DB_URL)",
    )

    # Optional: keep a debug toggle instead of always printing
    p.add_argument(
        "--debug",
        action="store_true",
        help="Print debugging information (columns, sample rows).",
    )

    return p.parse_args()


def main():
    args = parse_args()
    _require_venv()

    input_path = Path(args.input_csv)
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")

    # Load the prepared input dataset
    df = pd.read_csv(input_path)

    # Normalize input schema to what rules/comap.py expects
    df = _normalize_input_columns(df)

    # Fix: ensure submit_date is a python datetime.date
    df = _parse_submit_date(df)

    # Load CoMAP configuration as DataFrames
    matrix_df, cutoff_df, meta_df = load_comap_config()

    if args.debug:
        print("Input columns:", list(df.columns))
        print(df[["platform", "loan_program", "fico", "submit_date"]].head(5).to_string(index=False))
        print("matrix columns:", list(matrix_df.columns))
        print("cutoff columns:", list(cutoff_df.columns))
        print("meta columns:", list(meta_df.columns))

    # Run CoMAP rules through the engine wrapper
    exceptions_df = run_comap_rules(df, matrix_df, cutoff_df, meta_df)

    # Attach run_id
    if exceptions_df is None or exceptions_df.empty:
        print(f"[{args.run_id}] No exceptions found.")
        return

    exceptions_df["run_id"] = args.run_id

    # DB column naming consistency
    exceptions_df = _rename_for_db(exceptions_df)

    if args.dry_run:
        print(f"[{args.run_id}] DRY RUN: {len(exceptions_df)} exception(s) would be written.")
        print(exceptions_df.head(25).to_string(index=False))
        return

    engine = create_engine(args.db_url)
    exceptions_df.to_sql("loan_exceptions", engine, if_exists="append", index=False)

    print(f"[{args.run_id}] Wrote {len(exceptions_df)} exception(s) to loan_exceptions.")


if __name__ == "__main__":
    main()
