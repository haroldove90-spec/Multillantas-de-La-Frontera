import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Hostinger provides the PORT environment variable automatically
const PORT = process.env.PORT || 3000;

// Path to the compiled static assets
const distPath = path.join(__dirname, "dist");

// Serve static assets with cache control
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true
}));

// API fallback endpoint just in case
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SPA fallback routing - always serve index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Error loading SPA index.html. Ensure 'npm run build' has executed successfully.");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Express production server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});
