Replace `resume.pdf` in this folder to update the downloadable resume.

When replacing it, also update `updatedAt` in `functions/api/resume.js` to the
PDF's modification time in ISO format. The local server reads that time from the
PDF automatically.
