# tests/fixtures.py
import pandas as pd
import pytest
from datetime import date

@pytest.fixture
def loan_df():
    return pd.DataFrame([
        {
            "SELLER Loan #": "L1",
            "platform": "prime",
            "type": "standard",
            "Term": 120,
            "FICO Borrower": 680,
            "Orig. Balance": 100_000,
            "loan program": "Unsec Std - 999 - 120",
            "Submit Date": date(2024, 6, 1),
        },
        {
            "SELLER Loan #": "L2",
            "platform": "prime",
            "type": "standard",
            "Term": 120,
            "FICO Borrower": 720,
            "Orig. Balance": 200_000,
            "loan program": "Unsec Std - 999 - 120",
            "Submit Date": date(2024, 6, 1),
        },
        {
            "SELLER Loan #": "L3",
            "platform": "sfy",
            "type": "hybrid",
            "Term": 144,
            "FICO Borrower": 650,
            "Orig. Balance": 150_000,
            "loan program": "SFY Hybrid",
            "Submit Date": date(2024, 7, 1),
        },
    ])
