import { NavLink } from "react-router-dom";

export default function NavBar() {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    marginRight: "1rem",
    textDecoration: "none",
    fontWeight: isActive ? "bold" : "normal"
  });

  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        marginBottom: "1rem"
      }}
    >
      <NavLink to="/" style={linkStyle}>
        Home
      </NavLink>
      <NavLink to="/runs" style={linkStyle}>
        Runs
      </NavLink>
      <NavLink to="/health" style={linkStyle}>
        Health
      </NavLink>
    </nav>
  );
}
