from dataclasses import dataclass
from datetime import date

@dataclass(frozen=True)
class RunContext:
    run_id: str
    as_of_date: date
