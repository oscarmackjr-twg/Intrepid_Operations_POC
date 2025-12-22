import pandas as pd


def comap_rules(df, matrix, cutoff_cfg, meta_cfg):
    """
    Loan-level CoMAP eligibility checks.

    Expected loan columns (snake_case):
      - seller_loan_no
      - platform
      - loan_program
      - fico
      - submit_date

    Expected config columns (snake_case):
      matrix:
        - comap_id, platform, loan_program, fico_min, fico_max
      cutoff_cfg:
        - platform, cutoff_date, comap_id_pre, comap_id_post
      meta_cfg:
        - comap_id, severity
    """

    exceptions = []

    for _, loan in df.iterrows():
        platform = loan["platform"]
        program = loan["loan_program"]
        fico = loan["fico"]
        submit_date = loan["submit_date"]

        # Safety: submit_date must be a date
        if isinstance(submit_date, str):
            submit_date = pd.to_datetime(submit_date).date()

        cutoff_rows = cutoff_cfg[cutoff_cfg["platform"] == platform]
        if cutoff_rows.empty:
            continue

        cutoff = cutoff_rows.iloc[0]

        comap_id = (
            cutoff["comap_id_post"]
            if submit_date > cutoff["cutoff_date"]
            else cutoff["comap_id_pre"]
        )

        eligible_rows = matrix[
            (matrix["comap_id"] == comap_id)
            & (matrix["platform"] == platform)
            & (matrix["loan_program"] == program)
        ]

        # Program not governed by CoMAP
        if eligible_rows.empty:
            continue

        qualifies = eligible_rows[
            (eligible_rows["fico_min"] <= fico)
            & (eligible_rows["fico_max"] >= fico)
        ]

        if qualifies.empty:
            severity = meta_cfg.loc[
                meta_cfg["comap_id"] == comap_id, "severity"
            ].iloc[0]

            exceptions.append(
                {
                    "seller_loan_no": loan["seller_loan_no"],
                    "rule_id": comap_id,
                    "exception_type": "COMAP",
                    "platform": platform,
                    "loan_program": program,
                    "fico": fico,
                    "severity": severity,
                }
            )

    return pd.DataFrame(exceptions)
