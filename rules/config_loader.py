"""
rules/config_loader.py

Loads rule configuration used by the Python rules engine.

NOTE:
- The CoMAP rule implementation (rules/comap.py) expects *pandas DataFrames* for:
  - matrix      : eligible FICO ranges by comap_id/platform/loan_program
  - cutoff_cfg  : cutoff date + comap ids by platform
  - meta_cfg    : metadata (e.g., severity) by comap_id

This module returns DataFrames accordingly so run_engine.py can call:
    matrix, cutoff_cfg, meta_cfg = load_comap_config()

You can later replace the hard-coded defaults by loading from your RDS tables,
CSV files, or another configuration store.
"""

from __future__ import annotations

from datetime import date
from typing import Tuple, Optional, Any

import pandas as pd
from sqlalchemy import text


def _lower_cols(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def _require_columns(df: pd.DataFrame, required: set[str], name: str) -> None:
    missing = sorted(required - set(df.columns))
    if missing:
        raise ValueError(f"{name} is missing required columns: {missing}")


# ---------------------------------------------------------------------
# Generic rule loaders (DB-backed)
# ---------------------------------------------------------------------
def load_purchase_price_rule(engine, as_of_date):
    sql = text("""
        SELECT *
        FROM rule_purchase_price_config
        WHERE enabled = TRUE
          AND (effective_start_date IS NULL OR effective_start_date <= :dt)
          AND (effective_end_date IS NULL OR effective_end_date >= :dt)
        ORDER BY effective_start_date DESC NULLS LAST
        LIMIT 1
    """)

    df = pd.read_sql(sql, engine, params={"dt": as_of_date})
    return df


def load_eligibility_rules(engine, as_of_date):
    sql = text("""
        SELECT *
        FROM rule_eligibility_config
        WHERE enabled = TRUE
          AND (effective_start_date IS NULL OR effective_start_date <= :dt)
          AND (effective_end_date IS NULL OR effective_end_date >= :dt)
    """)

    return pd.read_sql(sql, engine, params={"dt": as_of_date})



# ---------------------------------------------------------------------
# CoMAP configuration loader (DataFrame-backed)
# ---------------------------------------------------------------------
def load_comap_config(xlsx_path: str | Path | None = None):
    """
    Load CoMAP configuration from the given Excel path.
    If xlsx_path is None, fall back to the existing default behavior.
    """
    if xlsx_path is None:
        # keep your current default path logic here
        # example (adjust to match your repo):
        # base = Path(__file__).resolve().parents[1]
        # xlsx_path = base / "inputs" / "Underwriting_Grids_COMAP.xlsx"
        ...
    else:
        xlsx_path = Path(xlsx_path)

    # -------------------------
    # DEFAULTS
    # -------------------------
    matrix = pd.DataFrame(
        [
            {
                "comap_id": "PRIME_COMAP",
                "platform": "prime",
                "loan_program": "Unsec Std - 999 - 120",
                "fico_min": 700,
                "fico_max": 749,
            },
            {
                "comap_id": "SFY_COMAP",
                "platform": "sfy",
                "loan_program": "SFY Hybrid",
                "fico_min": 700,
                "fico_max": 850,
            },
        ]
    )

    cutoff_cfg = pd.DataFrame(
        [
            {
                "platform": "prime",
                "cutoff_date": date(2024, 6, 11),
                "comap_id_pre": "PRIME_COMAP",
                "comap_id_post": "PRIME_COMAP",
            },
            {
                "platform": "sfy",
                "cutoff_date": date(2024, 6, 11),
                "comap_id_pre": "SFY_COMAP",
                "comap_id_post": "SFY_COMAP",
            },
        ]
    )

    meta_cfg = pd.DataFrame(
        [
            {"comap_id": "PRIME_COMAP", "severity": "HIGH"},
            {"comap_id": "SFY_COMAP", "severity": "HIGH"},
        ]
    )

    # Normalize column names FIRST (critical when you later swap to DB/CSV sources)
    matrix = _lower_cols(matrix)
    cutoff_cfg = _lower_cols(cutoff_cfg)
    meta_cfg = _lower_cols(meta_cfg)

    _require_columns(matrix, {"comap_id", "platform", "loan_program", "fico_min", "fico_max"}, "matrix")
    _require_columns(cutoff_cfg, {"platform", "cutoff_date", "comap_id_pre", "comap_id_post"}, "cutoff_cfg")
    _require_columns(meta_cfg, {"comap_id", "severity"}, "meta_cfg")

    return matrix, cutoff_cfg, meta_cfg
