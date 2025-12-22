def write_exceptions(engine, run_id, exceptions_df):
    if exceptions_df.empty:
        return

    exceptions_df = exceptions_df.copy()
    exceptions_df["run_id"] = run_id
    exceptions_df["created_at"] = pd.Timestamp.utcnow()

    exceptions_df.to_sql(
        "loan_exceptions",
        engine,
        if_exists="append",
        index=False
    )




def write_portfolio_exceptions(engine, run_id, df):
    if df.empty:
        return

    df = df.copy()
    df["run_id"] = run_id
    df["created_at"] = pd.Timestamp.utcnow()

    df.to_sql(
        "portfolio_exceptions",
        engine,
        if_exists="append",
        index=False
    )


def export_eligibility_exceptions(engine, run_id, output_path):
    df = pd.read_sql("""
        SELECT *
        FROM portfolio_exceptions
        WHERE run_id = :run_id
    """, engine, params={"run_id": run_id})

    df.to_excel(output_path, index=False)
