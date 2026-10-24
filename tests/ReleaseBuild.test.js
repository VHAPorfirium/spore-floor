import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRelease } from "../scripts/buildRelease.js";

const projectRootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function listJavaScriptFilesRecursively(directory) {
  return readdirSync(directory).flatMap((entryName) => {
    const entryPath = join(directory, entryName);
    if (statSync(entryPath).isDirectory()) {
      return listJavaScriptFilesRecursively(entryPath);
    }
    return entryName.endsWith(".js") ? [entryPath] : [];
  });
}

function listRelativeImportPaths(javaScriptSource) {
  const importPattern = /(?:import|export)[^"'`]*?from\s*["'](\.{1,2}\/[^"']+)["']/g;
  return [...javaScriptSource.matchAll(importPattern)].map((importMatch) => importMatch[1]);
}

/** No Windows "Player.js" e "player.js" são o mesmo arquivo; no servidor do itch.io não. */
function existsWithExactCase(filePath) {
  return existsSync(filePath) && readdirSync(dirname(filePath)).includes(basename(filePath));
}

function findBrokenImports(sourceDirectory) {
  return listJavaScriptFilesRecursively(sourceDirectory).flatMap((javaScriptFilePath) =>
    listRelativeImportPaths(readFileSync(javaScriptFilePath, "utf8"))
      .map((relativeImportPath) => resolve(dirname(javaScriptFilePath), relativeImportPath))
      .filter((importedFilePath) => !existsWithExactCase(importedFilePath))
      .map((importedFilePath) => `${javaScriptFilePath} -> ${importedFilePath}`),
  );
}

test("every relative import in src points to a file that exists with the exact same letter case", () => {
  assert.deepEqual(findBrokenImports(join(projectRootDirectory, "src")), []);
});

test("index.html loads the main module that exists", () => {
  const indexHtml = readFileSync(join(projectRootDirectory, "index.html"), "utf8");
  assert.match(indexHtml, /<script type="module" src="src\/main\.js">/);
  assert.ok(existsWithExactCase(join(projectRootDirectory, "src", "main.js")));
});

test("the release build has only what the player needs, with debug turned off", () => {
  const temporaryFolder = mkdtempSync(join(tmpdir(), "spore-floor-release-"));
  const releaseDirectory = join(temporaryFolder, "release");
  try {
    const gameVersion = buildRelease(projectRootDirectory, releaseDirectory);
    const packageInformation = JSON.parse(readFileSync(join(projectRootDirectory, "package.json"), "utf8"));

    assert.deepEqual(readdirSync(releaseDirectory).sort(), ["index.html", "src"]);
    assert.equal(gameVersion, packageInformation.version);

    const releaseBuildInformation = readFileSync(join(releaseDirectory, "src", "buildInformation.js"), "utf8");
    assert.match(releaseBuildInformation, /isReleaseBuild: true/);
    assert.match(releaseBuildInformation, new RegExp(`gameVersion: "${packageInformation.version}"`));

    assert.deepEqual(findBrokenImports(join(releaseDirectory, "src")), []);
  } finally {
    rmSync(temporaryFolder, { recursive: true, force: true });
  }
});

test("building the release twice works (the old release folder is replaced)", () => {
  const temporaryFolder = mkdtempSync(join(tmpdir(), "spore-floor-release-"));
  const releaseDirectory = join(temporaryFolder, "release");
  try {
    buildRelease(projectRootDirectory, releaseDirectory);
    buildRelease(projectRootDirectory, releaseDirectory);
    assert.deepEqual(readdirSync(releaseDirectory).sort(), ["index.html", "src"]);
  } finally {
    rmSync(temporaryFolder, { recursive: true, force: true });
  }
});

test("the development build keeps debug available and is not marked as release", async () => {
  const { buildInformation } = await import("../src/buildInformation.js");
  assert.equal(buildInformation.isReleaseBuild, false);
});
