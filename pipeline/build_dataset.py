from pathlib import Path
from typing import Tuple, Dict, Any

import pandas as pd


def _load_exhibit(path: Path) -> pd.DataFrame:
    """
    Load an Exhibit A workbook in the same pattern as the original notebook:

        - Skip the first 4 non-data rows
        - Use the next row as the header row
        - Drop that header row from the data
    """
    df = pd.read_excel(path)

    # If the sheet is unexpectedly small, just return as-is
    if df.shape[0] <= 5:
        return df

    # Notebook pattern:
    #   df = df.iloc[4:].reset_index(drop=True)
    #   df.columns = df.iloc[0]
    #   df = df[1:].reset_index(drop=True)
    df = df.iloc[4:].reset_index(drop=True)
    df.columns = df.iloc[0]
    df = df[1:].reset_index(drop=True)

    return df


def build_dataset(
    *,
    prime_exhibit_a_path: str,
    sfy_exhibit_a_path: str,
    master_sheet_path: str,
    master_sheet_notes_path: str,
    output_csv_path: str,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Build the engine input dataset and write it to output_csv_path.

    Behavior:

      - Load PRIME Exhibit A, SFY Exhibit A
      - Normalize headers (skip first 4 rows, use next row as header)
      - Normalize SFY TU144 column
      - Tag Platform (PRIME / SFY)
      - Concatenate PRIME + SFY
      - Optionally enrich with master sheet + notes
      - Ensure normalized columns used by downstream rules:
          * seller_loan_no
          * lender_price_pct  (fraction from Lender Price(%))
          * loan_program      (normalized program name)
          * fico              (numeric FICO score)
          * submit_date       (normalized submit date)
      - Write engine_input.csv

    Returns:
        loans_df:  final loan-level DataFrame (engine input)
        artifacts: dict with at least {"engine_input_csv": output_csv_path}
    """

    prime_path = Path(prime_exhibit_a_path)
    sfy_path = Path(sfy_exhibit_a_path)
    master_path = Path(master_sheet_path)
    notes_path = Path(master_sheet_notes_path)
    out_csv = Path(output_csv_path)

    # ---------------------------------------------------------
    # 1) Load Exhibit A files
    # ---------------------------------------------------------
    sfy_df = _load_exhibit(sfy_path)
    prime_df = _load_exhibit(prime_path)

    # Normalize SFY TU144 column name, if present
    if not sfy_df.empty:
        sfy_df = sfy_df.rename(
            columns={
                "TU_144": "TU144",
                "Tu_144": "TU144",
                "tu_144": "TU144",
            }
        )

    # Tag platforms
    if not sfy_df.empty:
        sfy_df["Platform"] = "SFY"
    if not prime_df.empty:
        prime_df["Platform"] = "PRIME"

    # ---------------------------------------------------------
    # 2) Concatenate PRIME + SFY loan rows
    # ---------------------------------------------------------
    if not prime_df.empty and not sfy_df.empty:
        loans_df = pd.concat([prime_df, sfy_df], ignore_index=True)
    elif not prime_df.empty:
        loans_df = prime_df.copy()
    elif not sfy_df.empty:
        loans_df = sfy_df.copy()
    else:
        loans_df = pd.DataFrame()

    # ---------------------------------------------------------
    # 3) Optional: enrich with MASTER_SHEET + Notes
    # ---------------------------------------------------------
    try:
        master_df = pd.read_excel(master_path)
        notes_df = pd.read_excel(notes_path)

        if not master_df.empty and "platform" in master_df.columns:
            master_df["Platform"] = master_df["platform"].astype(str).str.upper()

        if not notes_df.empty:
            if "loan program" in notes_df.columns:
                notes_df["loan program"] = notes_df["loan program"].astype(str) + "notes"
            if "platform" in notes_df.columns:
                notes_df["Platform"] = notes_df["platform"].astype(str).str.upper()

        df_loans_types = pd.concat([master_df, notes_df], ignore_index=True)

        # Only attempt merge if expected join keys exist
        if (
            not loans_df.empty
            and "Loan Program" in loans_df.columns
            and "Platform" in loans_df.columns
            and "loan program" in df_loans_types.columns
            and "Platform" in df_loans_types.columns
        ):
            loans_df = loans_df.rename(columns={"Loan Program": "loan program"})
            loans_df = loans_df.merge(
                df_loans_types,
                on=["loan program", "Platform"],
                how="left",
            )
    except Exception:
        # If enrichment fails for any reason, proceed with Exhibit A data only
        pass

    # ---------------------------------------------------------
    # 4) Ensure seller_loan_no is present (for tape repurchase logic)
    # ---------------------------------------------------------
    if not loans_df.empty:
        # Normalize "SELLER Loan #" if present
        if "SELLER Loan #" in loans_df.columns:
            loans_df["SELLER Loan #"] = loans_df["SELLER Loan #"].astype(str).str.strip()

        # Create seller_loan_no if missing
        if "seller_loan_no" not in loans_df.columns:
            if "SELLER Loan #" in loans_df.columns:
                loans_df["seller_loan_no"] = loans_df["SELLER Loan #"].astype(str).str.strip()
            elif "Seller Loan #" in loans_df.columns:
                loans_df["seller_loan_no"] = loans_df["Seller Loan #"].astype(str).str.strip()
            elif "Account Number" in loans_df.columns:
                loans_df["seller_loan_no"] = loans_df["Account Number"].astype(str).str.strip()

    # ---------------------------------------------------------
    # 5) Ensure lender_price_pct is present (for purchase price rules)
    # ---------------------------------------------------------
    if not loans_df.empty:
        if "Lender Price(%)" in loans_df.columns and "lender_price_pct" not in loans_df.columns:
            # Convert percent to fraction (e.g., 97 -> 0.97)
            lender_series = pd.to_numeric(loans_df["Lender Price(%)"], errors="coerce")
            loans_df["lender_price_pct"] = lender_series / 100.0

    # ---------------------------------------------------------
    # 6) Ensure loan_program is present (for CoMAP rules)
    # ---------------------------------------------------------
    if not loans_df.empty and "loan_program" not in loans_df.columns:
        if "loan program" in loans_df.columns:
            loans_df["loan_program"] = loans_df["loan program"]
        elif "Loan Program" in loans_df.columns:
            loans_df["loan_program"] = loans_df["Loan Program"]

    # ---------------------------------------------------------
    # 7) Ensure fico is present (for CoMAP rules)
    # ---------------------------------------------------------
    if not loans_df.empty and "fico" not in loans_df.columns:
        # Try common FICO column variants; your data shows "FICO Borrower"
        if "FICO Borrower" in loans_df.columns:
            loans_df["fico"] = pd.to_numeric(loans_df["FICO Borrower"], errors="coerce")
        elif "FICO" in loans_df.columns:
            loans_df["fico"] = pd.to_numeric(loans_df["FICO"], errors="coerce")
        elif "fico_score" in loans_df.columns:
            loans_df["fico"] = pd.to_numeric(loans_df["fico_score"], errors="coerce")

    # ---------------------------------------------------------
    # 8) Ensure submit_date is present (for CoMAP rules)
    # ---------------------------------------------------------
    if not loans_df.empty and "submit_date" not in loans_df.columns:
        # Your data shows "Submit Date"
        if "Submit Date" in loans_df.columns:
            loans_df["submit_date"] = pd.to_datetime(
                loans_df["Submit Date"], errors="coerce"
            )
        elif "submit date" in loans_df.columns:
            loans_df["submit_date"] = pd.to_datetime(
                loans_df["submit date"], errors="coerce"
            )

    # ---------------------------------------------------------
    # 9) Write engine input CSV
    # ---------------------------------------------------------
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    loans_df.to_csv(out_csv, index=False)

    artifacts: Dict[str, Any] = {
        "engine_input_csv": str(out_csv),
    }

    return loans_df, artifacts
