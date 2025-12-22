# tests/test_comap_rules.py
import pandas as pd
from datetime import date
from rules.comap import comap_rules

def test_comap_violation(loan_df):
    matrix = pd.DataFrame([
        {
            "comap_id": "PRIME_NEW",
            "platform": "prime",
            "loan_program": "Unsec Std - 999 - 120",
            "fico_min": 700,
            "fico_max": 749,
        }
    ])

    cutoff_cfg = pd.DataFrame([
        {
            "platform": "prime",
            "cutoff_date": date(2024, 6, 11),
            "comap_id_pre": "PRIME_OLD",
            "comap_id_post": "PRIME_NEW",
        }
    ])

    meta_cfg = pd.DataFrame([
        {"comap_id": "PRIME_NEW", "severity": "HIGH"}
    ])

    result = comap_rules(loan_df, matrix, cutoff_cfg, meta_cfg)

    assert len(result) == 1
    assert result.iloc[0]["SELLER Loan #"] == "L1"
    assert result.iloc[0]["exception_type"] == "COMAP"



#Pass case FICO in band

def test_comap_passes_when_fico_in_band(loan_df):
    loan_df.loc[0, "FICO Borrower"] = 720

    matrix = pd.DataFrame([
        {
            "comap_id": "PRIME_NEW",
            "platform": "prime",
            "loan_program": "Unsec Std - 999 - 120",
            "fico_min": 700,
            "fico_max": 749,
        }
    ])

    cutoff_cfg = pd.DataFrame([
        {
            "platform": "prime",
            "cutoff_date": date(2024, 6, 11),
            "comap_id_pre": "PRIME_OLD",
            "comap_id_post": "PRIME_NEW",
        }
    ])

    meta_cfg = pd.DataFrame([
        {"comap_id": "PRIME_NEW", "severity": "HIGH"}
    ])

    result = comap_rules(loan_df, matrix, cutoff_cfg, meta_cfg)

    assert result.empty



# Program Not Governed

def test_comap_ignores_unmapped_program(loan_df):
    matrix = pd.DataFrame([
        {
            "comap_id": "PRIME_NEW",
            "platform": "prime",
            "loan_program": "OTHER PROGRAM",
            "fico_min": 700,
            "fico_max": 750,
        }
    ])

    cutoff_cfg = pd.DataFrame([
        {
            "platform": "prime",
            "cutoff_date": date(2024, 6, 11),
            "comap_id_pre": "PRIME_OLD",
            "comap_id_post": "PRIME_NEW",
        }
    ])

    meta_cfg = pd.DataFrame([
        {"comap_id": "PRIME_NEW", "severity": "HIGH"}
    ])

    result = comap_rules(loan_df, matrix, cutoff_cfg, meta_cfg)
    assert result.empty


