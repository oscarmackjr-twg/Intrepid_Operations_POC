from pathlib import Path
from typing import Dict, Any

import pandas as pd


def export_comap_not_passed(comap_df: pd.DataFrame, output_dir: str | Path) -> Dict[str, Any]:
    """
    Export the CoMAP 'not passed' rows to comap_not_passed.xlsx.

    Assumptions:
      * comap_df is already the set of loans that did NOT pass CoMAP
        (this matches how run_comap_rules is used in run_pipeline.py).

    Args:
        comap_df:  DataFrame returned from run_comap_rules, representing
                   CoMAP exceptions (not passed).
        output_dir: directory where the Excel will be written.

    Returns:
        A dict with the artifact path and row count:
            {
              "comap_not_passed_xlsx": ".../comap_not_passed.xlsx",
              "rows": <int>
            }
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    out_path = output_dir / "comap_not_passed.xlsx"

    if comap_df is None or comap_df.empty:
        # Still create an empty file so the UI has a stable artifact path
        empty_df = pd.DataFrame()
        empty_df.to_excel(out_path, index=False)
        return {
            "comap_not_passed_xlsx": str(out_path),
            "rows": 0,
        }

    # Export all columns; you can subset / reorder later if needed
    comap_df.to_excel(out_path, index=False)

    return {
        "comap_not_passed_xlsx": str(out_path),
        "rows": int(len(comap_df)),
    }
