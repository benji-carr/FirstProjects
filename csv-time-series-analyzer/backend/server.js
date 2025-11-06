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
    "analyzer.py",
    req.file.path,
    model,
    time_column,
    value_column,
  ]);

  let data = "";
  let error = "";

  py.stdout.on("data", (chunk) => (data += chunk.toString()));
  py.stderr.on("data", (chunk) => (error += chunk.toString()));

  py.on("close", (code) => {
    if (code !== 0) {
      console.error("Python error:", error);
      res.status(500).json({ error });
    } else {
      res.json({ response: data });
    }
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server running on port 8080");
});
