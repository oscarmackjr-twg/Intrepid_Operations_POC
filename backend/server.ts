// backend/server.ts
import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

console.log("[server] Starting backend...");
console.log("[server] NODE_ENV:", process.env.NODE_ENV);
console.log("[server] PORT:", PORT);

app.listen(PORT, () => {
  console.log(
    `Backend listening on http://localhost:${PORT} (NODE_ENV=${
      process.env.NODE_ENV || "dev"
    })`
  );
});

// Optional: log any crashes instead of silently exiting
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled rejection:", reason);
});
