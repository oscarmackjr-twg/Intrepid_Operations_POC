def test_comap_matches_notebook_output():
    df = pd.read_csv("tests/data/comap_input.csv")
    expected = pd.read_csv("tests/data/comap_expected.csv")

    result = comap_rules(df, matrix, cutoff_cfg, meta_cfg)

    pd.testing.assert_frame_equal(
        result.sort_values("SELLER Loan #").reset_index(drop=True),
        expected.sort_values("SELLER Loan #").reset_index(drop=True),
    )
