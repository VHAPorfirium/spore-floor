/**
 * Monta a pasta release/ só com o que o jogador precisa (index.html e src/).
 * Fica de fora: anomaly-preview.html, testes, scripts, README.
 * Na release, o modo debug é desligado e a versão vem do package.json.
 *
 * Uso: npm run release
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const filesAndFoldersThatGoToRelease = ["index.html", "src"];

export function createReleaseBuildInformationFileContent(gameVersion) {
  return `/** Gerado por scripts/buildRelease.js. Não edite na pasta release/. */
export const buildInformation = Object.freeze({
  isReleaseBuild: true,
  gameVersion: ${JSON.stringify(gameVersion)},
});
`;
}

export function buildRelease(projectRootDirectory, releaseDirectory) {
  const packageInformation = JSON.parse(readFileSync(join(projectRootDirectory, "package.json"), "utf8"));

  if (existsSync(releaseDirectory)) {
    rmSync(releaseDirectory, { recursive: true });
  }
  mkdirSync(releaseDirectory, { recursive: true });

  filesAndFoldersThatGoToRelease.forEach((relativePath) => {
    cpSync(join(projectRootDirectory, relativePath), join(releaseDirectory, relativePath), { recursive: true });
  });

  writeFileSync(
    join(releaseDirectory, "src", "buildInformation.js"),
    createReleaseBuildInformationFileContent(packageInformation.version),
  );

  return packageInformation.version;
}

const isRunningFromCommandLine = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isRunningFromCommandLine) {
  const projectRootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const releaseDirectory = join(projectRootDirectory, "release");
  const gameVersion = buildRelease(projectRootDirectory, releaseDirectory);
  console.log(`Release ${gameVersion} pronta em release/`);
  console.log("Para gerar o .zip do itch.io (PowerShell):");
  console.log(`  Compress-Archive -Path release\\* -DestinationPath spore-floor-${gameVersion}.zip -Force`);
}
