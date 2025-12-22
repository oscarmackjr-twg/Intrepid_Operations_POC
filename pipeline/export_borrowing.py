from __future__ import annotations
from pathlib import Path
import pandas as pd


def export_borrowing_file(df: pd.DataFrame, out_path: str) -> str:
    """
    Skeleton exporter. Adjust columns/order to notebook parity later.
    """
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # For now, just export the dataframe as-is
    df.to_csv(out, index=False)
    return str(out)
