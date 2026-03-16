import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");

async function collectJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return collectJsFiles(fullPath);
      }

      return entry.name.endsWith(".js") ? [fullPath] : [];
    })
  );

  return files.flat();
}

function checkFile(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--check", filePath], {
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Syntax check failed for ${path.relative(projectRoot, filePath)}`));
    });

    child.on("error", reject);
  });
}

const jsFiles = await collectJsFiles(srcDir);

for (const filePath of jsFiles) {
  await checkFile(filePath);
}

console.log(`Syntax check passed for ${jsFiles.length} files.`);
