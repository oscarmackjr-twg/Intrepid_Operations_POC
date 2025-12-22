import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Loan Review Application</h1>
      <p>Select a workflow to begin:</p>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", maxWidth: 400 }}>
        <MenuButton
          label="📊 Review Runs"
          description="View historical loan review runs and statuses"
          onClick={() => navigate("/runs")}
        />

        <MenuButton
          label="📈 Run Summary"
          description="View portfolio-level metrics and exception counts"
          onClick={() => navigate("/runs/latest")}
        />

        <MenuButton
          label="⚠️ Exceptions"
          description="Review CoMAP and eligibility exceptions"
          onClick={() => navigate("/runs/latest/exceptions")}
        />

        <MenuButton
          label="🩺 System Health"
          description="Backend and rule engine health checks"
          onClick={() => navigate("/health")}
        />
      </div>
    </div>
  );
}

type MenuButtonProps = {
  label: string;
  description: string;
  onClick: () => void;
};

function MenuButton({ label, description, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "1rem",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: "#f9f9f9",
        cursor: "pointer"
      }}
    >
      <strong>{label}</strong>
      <div style={{ fontSize: "0.9rem", color: "#555" }}>{description}</div>
    </button>
  );
}
