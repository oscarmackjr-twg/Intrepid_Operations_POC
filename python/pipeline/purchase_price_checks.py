# python/pipeline/purchase_price_checks.py

from pathlib import Path
import pandas as pd


MISMATCH_XLSX_NAME = "purchase_price_mismatch.xlsx"
MISMATCH_CSV_NAME = "purchase_price_mismatch.csv"


def compute_purchase_price_mismatch(loans_df: pd.DataFrame) -> pd.DataFrame:
    """
    Given the pipeline loans_df (final_df in the original notebook),
    compute the subset of loans where the modeled purchase price does
    not match the lender price.

    This mirrors the notebook logic:

        final_df['purchase_price_check'] = (
            final_df['Lender Price(%)'] ==
            round(final_df['modeled_purchase_price'] * 100, 2)
        )

        final_df[final_df['purchase_price_check'] == False]

    We also trim to the first 30 columns, as in the notebook output
    for purchase_price_mismatch.xlsx.
    """
    if loans_df is None or loans_df.empty:
        return loans_df.iloc[0:0, :]  # empty with same columns

    df = loans_df.copy()

    # Be defensive about missing columns
    required_cols = {"Lender Price(%)", "modeled_purchase_price"}
    if not required_cols.issubset(df.columns):
        # If the columns aren't present, return an empty frame so
        # the rest of the pipeline still runs.
        return df.iloc[0:0, :]

    # Replicate the purchase_price_check logic
    df["purchase_price_check"] = (
        df["Lender Price(%)"].round(2)
        == (df["modeled_purchase_price"] * 100).round(2)
    )

    mismatches = df[df["purchase_price_check"] == False].copy()

    # Match the original notebook behavior: keep only the first 30 columns
    mismatches = mismatches.iloc[:, :30]

    return mismatches


def export_purchase_price_mismatch(loans_df: pd.DataFrame, output_dir: Path) -> dict:
    """
    Compute purchase price mismatches and write them to:

        purchase_price_mismatch.xlsx
        purchase_price_mismatch.csv

    inside the given output_dir.

    Returns a small dict with artifact paths and row count, e.g.:

        {
          "purchase_price_mismatch_xlsx": "...",
          "purchase_price_mismatch_csv": "...",
          "rows": 42
        }
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    mismatches = compute_purchase_price_mismatch(loans_df)

    # If no mismatches, don't emit files
    if mismatches is None or mismatches.empty:
        return {"rows": 0}

    xlsx_path = output_dir / MISMATCH_XLSX_NAME
    csv_path = output_dir / MISMATCH_CSV_NAME

    mismatches.to_excel(xlsx_path, index=False)
    mismatches.to_csv(csv_path, index=False)

    return {
        "purchase_price_mismatch_xlsx": str(xlsx_path),
        "purchase_price_mismatch_csv": str(csv_path),
        "rows": int(len(mismatches)),
    }
