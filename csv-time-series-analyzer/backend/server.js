import express from "express";
import multer from "multer";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/api/process-csv", upload.single("csv_file"), (req, res) => {
  const { model, time_column, value_column } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "CSV file missing" });
  }

  console.log("Running model:", model);
  console.log("File path:", req.file.path);

  const py = spawn("python", [
    "-u",
    "analyzer.py",
    req.file.path,
    model,
    time_column,
    value_column,
  ]);

  let data = "";
  let error = "";

  // Capture stdout & stderr
  py.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    data += text;
    console.log("[PYTHON OUTPUT]:", text.trim());
  });

  py.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    error += text;
    console.error("[PYTHON ERROR]:", text.trim());
  });

  // Handle Python process start errors
  py.on("error", (err) => {
    console.error("Failed to start Python process:", err);
    res.status(500).json({ error: "Python process failed to start" });
  });

  // Handle Python exit (success or failure)
  py.on("close", (code) => {
    console.log("Python exited with code:", code);
    if (code !== 0) {
      console.error("Python error:", error);
      return res.status(500).json({ error: error || "Python script failed" });
    }
    res.json({ response: data || "No output received from Python script." });
  });

  // Timeout safeguard (2 min)
  setTimeout(() => {
    console.error("Python script timed out. Killing process...");
    py.kill();
    if (!res.headersSent) {
      res.status(504).json({ error: "Python script timed out" });
    }
  }, 120000); // 2 minutes
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server running on port 8080");
});
