from __future__ import annotations
from pathlib import Path
import pandas as pd


def export_ratios_xlsx(metrics_df: pd.DataFrame, out_path: str) -> str:
    """
    Skeleton Excel exporter. Notebook has multiple tabs; we'll start with one.
    """
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(out, engine="openpyxl") as writer:
        metrics_df.to_excel(writer, sheet_name="Ratios", index=False)

    return str(out)
