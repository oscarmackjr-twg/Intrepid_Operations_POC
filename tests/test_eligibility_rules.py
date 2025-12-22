# tests/test_eligibility_rules.py
import pandas as pd
from rules.eligibility import eligibility_rules

def test_eligibility_ratio_violation(loan_df):
    rules_cfg = pd.DataFrame([
        {
            "rule_id": "PRIME_FICO_LT_700",
            "platform": "prime",
            "loan_type": "standard",
            "min_term": None,
            "max_term": 144,
            "fico_threshold": 700,
            "max_ratio": 0.20,
            "balance_column": "Orig. Balance",
            "severity": "HIGH",
        }
    ])

    result = eligibility_rules(loan_df, rules_cfg)

    assert len(result) == 1
    assert result.iloc[0]["rule_id"] == "PRIME_FICO_LT_700"
    assert round(result.iloc[0]["actual_value"], 2) == 0.33




#No violation case

def test_eligibility_passes_when_under_threshold(loan_df):
    rules_cfg = pd.DataFrame([
        {
            "rule_id": "PRIME_SAFE",
            "platform": "prime",
            "loan_type": "standard",
            "min_term": None,
            "max_term": 144,
            "fico_threshold": 650,
            "max_ratio": 0.80,
            "balance_column": "Orig. Balance",
            "severity": "LOW",
        }
    ])

    result = eligibility_rules(loan_df, rules_cfg)

    assert result.empty



#Zero Denominator

def test_eligibility_zero_denominator():
    df = pd.DataFrame([
        {
            "platform": "sfy",
            "Orig. Balance": 0,
        }
    ])

    rules_cfg = pd.DataFrame([
        {
            "rule_id": "SFY_ZERO",
            "platform": "prime",
            "loan_type": None,
            "min_term": None,
            "max_term": None,
            "fico_threshold": None,
            "max_ratio": 0.10,
            "balance_column": "Orig. Balance",
            "severity": "HIGH",
        }
    ])

    result = eligibility_rules(df, rules_cfg)
    assert result.empty


