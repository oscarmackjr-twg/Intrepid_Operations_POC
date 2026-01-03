# python/run_engine.py
import sys
import pandas as pd
from sqlalchemy import create_engine
from rules.comap import comap_rules

run_id = sys.argv[1]

engine = create_engine("postgresql://localhost/loan_test")

# Load input data (CSV or staging table)
df = pd.read_csv("tests/data/comap_input.csv", parse_dates=["Submit Date"])

# Load CoMAP config (simplified)
matrix = pd.DataFrame([
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
        "fico_max": 759,
    },
])

cutoff = pd.DataFrame([
    {
        "platform": "prime",
        "cutoff_date": "2024-01-01",
        "comap_id_pre": "PRIME_COMAP",
        "comap_id_post": "PRIME_COMAP",
    },
    {
        "platform": "sfy",
        "cutoff_date": "2024-01-01",
        "comap_id_pre": "SFY_COMAP",
        "comap_id_post": "SFY_COMAP",
    },
])

meta = pd.DataFrame([
    {"comap_id": "PRIME_COMAP", "severity": "HIGH"},
    {"comap_id": "SFY_COMAP", "severity": "HIGH"},
])

exceptions = comap_rules(df, matrix, cutoff, meta)

exceptions["run_id"] = run_id

exceptions.rename(columns={
    "SELLER Loan #": "seller_loan_no"
}, inplace=True)

exceptions.to_sql(
    "loan_exceptions",
    engine,
    if_exists="append",
    index=False
)
