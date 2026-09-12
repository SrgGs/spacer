import { copyFile, mkdir, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const exportDirectory = new URL("../dist/client/", import.meta.url);

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
    } else if (entry.name.endsWith(".html") && entry.name !== "index.html" && entry.name !== "404.html") {
      files.push(path);
    }
  }

  return files;
}

const htmlFiles = await collectHtmlFiles(exportDirectory.pathname);

for (const htmlFile of htmlFiles) {
  const routeDirectory = join(dirname(htmlFile), basename(htmlFile, ".html"));
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(htmlFile, join(routeDirectory, "index.html"));
}

console.log(`Prepared ${htmlFiles.length} clean URL(s) for manual upload.`);
