import app from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV || "dev"})`);
});
