from pathlib import Path
from typing import Dict, Any, Tuple

import pandas as pd


def _find_common_key(loans_df: pd.DataFrame, exceptions_df: pd.DataFrame) -> Tuple[str, str] | Tuple[None, None]:
    """
    Try to find a reasonable join key between the loans universe and the exceptions.
    Returns (loans_col, exceptions_col) or (None, None) if no reasonable key exists.
    """
    loan_candidates = ["seller_loan_no", "SELLER Loan #", "Seller Loan #", "Account Number"]
    ex_candidates = ["seller_loan_no", "SELLER Loan #", "Seller Loan #", "Account Number"]

    for lc in loan_candidates:
        if lc not in loans_df.columns:
            continue
        for ec in ex_candidates:
            if ec not in exceptions_df.columns:
                continue
            # Found a usable pair
            return lc, ec

    return None, None


def export_flagged_loans(
    loans_df: pd.DataFrame,
    exceptions_df: pd.DataFrame,
    output_dir: str | Path,
) -> Dict[str, Any]:
    """
    Export:
      * flagged_loans.xlsx         -> all loans that have at least one exception
      * NOTES_Flagged_loans.xlsx   -> subset of flagged loans where program is a "notes" program

    Heuristics:
      * A loan is "flagged" if its identifier appears in the exceptions table.
      * We look for a common key such as seller_loan_no / SELLER Loan # / Account Number.
      * "Notes" loans are identified by loan_program / loan program / type containing 'note'
        (case-insensitive). You can refine this later to match your exact notebook logic.

    Returns:
        {
          "flagged_loans_xlsx": ".../flagged_loans.xlsx",
          "notes_flagged_loans_xlsx": ".../NOTES_Flagged_loans.xlsx",
          "flagged_count": <int>,
          "notes_flagged_count": <int>,
        }
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    flagged_path = output_dir / "flagged_loans.xlsx"
    notes_flagged_path = output_dir / "NOTES_Flagged_loans.xlsx"

    # Default to empty
    flagged_loans_df = pd.DataFrame()
    notes_flagged_df = pd.DataFrame()

    if loans_df is not None and not loans_df.empty and exceptions_df is not None and not exceptions_df.empty:
        loans_key, ex_key = _find_common_key(loans_df, exceptions_df)
        if loans_key is not None and ex_key is not None:
            exception_ids = (
                exceptions_df[ex_key]
                .dropna()
                .astype(str)
                .str.strip()
                .unique()
            )

            flagged_loans_df = loans_df[
                loans_df[loans_key].astype(str).str.strip().isin(exception_ids)
            ].copy()

            # Build a "notes" mask based on program/type columns
            notes_mask = pd.Series(False, index=flagged_loans_df.index)

            for col in ["loan_program", "loan program", "Loan Program", "type", "Program", "program"]:
                if col in flagged_loans_df.columns:
                    col_mask = flagged_loans_df[col].astype(str).str.contains("note", case=False, na=False)
                    notes_mask = notes_mask | col_mask

            notes_flagged_df = flagged_loans_df[notes_mask].copy()
        else:
            # No common key – we'll leave both outputs empty but still create the files.
            pass

    # Always write the files so the frontend has stable artifact paths
    flagged_loans_df.to_excel(flagged_path, index=False)
    notes_flagged_df.to_excel(notes_flagged_path, index=False)

    return {
        "flagged_loans_xlsx": str(flagged_path),
        "notes_flagged_loans_xlsx": str(notes_flagged_path),
        "flagged_count": int(len(flagged_loans_df)),
        "notes_flagged_count": int(len(notes_flagged_df)),
    }
