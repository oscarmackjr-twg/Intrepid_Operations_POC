from __future__ import annotations
from typing import Tuple, List, Optional
import pandas as pd
from pathlib import Path

# Reuse the CLI implementation as the "source of truth" for now.
# If you prefer, we can move that logic here and make python/build_dataset.py a thin wrapper.
from python.build_dataset import build_dataset as _cli_build_dataset


def build_dataset(
    prime_exhibit_a_path: str,
    sfy_exhibit_a_path: str,
    master_sheet_path: str,
    master_sheet_notes_path: str,
    *,
    output_csv_path: Optional[str] = None,
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Build the unified engine input dataset.
    Returns (df_loans, artifacts).
    """
    artifacts: List[str] = []

    if output_csv_path is None:
        output_csv_path = str(Path("outputs") / "engine_input.csv")

    # The CLI build_dataset currently writes output and returns output path string.
    out_path = _cli_build_dataset(
        prime_exhibit_a=prime_exhibit_a_path,
        sfy_exhibit_a=sfy_exhibit_a_path,
        master_sheet=master_sheet_path,
        master_sheet_notes=master_sheet_notes_path,
        output_csv=output_csv_path,
    )

    artifacts.append(out_path)
    df = pd.read_csv(out_path)

    return df, artifacts
