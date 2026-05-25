const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const resumePath = path.join(__dirname, "public", "resume", "resume.pdf");

app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    if (filePath === resumePath) {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));

app.get("/api/profile", (_req, res) => {
  res.json({
    name: "Your Name",
    role: "Creative Developer",
    location: "Toronto, Canada",
    focus: ["Front-end UI", "Node.js", "Interactive Web"],
    email: "hello@example.com"
  });
});

app.get("/api/resume", (_req, res) => {
  fs.stat(resumePath, (error, stats) => {
    if (error) {
      res.status(404).json({ available: false });
      return;
    }

    res.json({
      available: true,
      file: "/resume/resume.pdf",
      updatedAt: stats.mtime.toISOString()
    });
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Portfolio website running at http://${HOST}:${PORT}`);
});
