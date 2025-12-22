# rules/__init__.py

"""
Rule engine package for loan review application.

This package contains:
- Portfolio-level rules (eligibility ratios)
- Loan-level rules (CoMAP, underwriting)
- Rule orchestration utilities
"""

from .engine import run_eligibility_rules, run_comap_rules
from .eligibility import eligibility_rules
from .comap import comap_rules

__all__ = [
    "run_eligibility_rules",
    "run_comap_rules",
    "eligibility_rules",
    "comap_rules",
]
