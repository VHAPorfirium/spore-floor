/**
 * Junta os logs de playtest (.json baixados com a tecla L) e mostra o resumo por anomalia.
 *
 * Uso: npm run playtest:summary -- pasta-com-os-logs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { summarizeDecisionsByAnomaly, AnomalyDifficultyVerdict } from "../src/application/DecisionLog.js";

const suggestionByDifficultyVerdict = Object.freeze({
  [AnomalyDifficultyVerdict.tooHard]: "deixar mais visível",
  [AnomalyDifficultyVerdict.tooEasy]: "deixar mais sutil",
  [AnomalyDifficultyVerdict.balanced]: "manter",
  [AnomalyDifficultyVerdict.notEnoughData]: "poucos dados",
});

export function readDecisionRecordsFromPlaytestLogFolder(playtestLogFolder) {
  const playtestLogFileNames = readdirSync(playtestLogFolder).filter((fileName) => fileName.endsWith(".json"));
  return playtestLogFileNames.flatMap((fileName) => {
    const playtestLog = JSON.parse(readFileSync(join(playtestLogFolder, fileName), "utf8"));
    return playtestLog.decisions ?? [];
  });
}

const playtestLogFolderArgument = process.argv[2];
if (playtestLogFolderArgument) {
  const decisionRecords = readDecisionRecordsFromPlaytestLogFolder(resolve(playtestLogFolderArgument));
  const summaryRows = summarizeDecisionsByAnomaly(decisionRecords).map((summaryRow) => ({
    ...summaryRow,
    suggestion: suggestionByDifficultyVerdict[summaryRow.difficultyVerdict],
  }));
  console.log(`${decisionRecords.length} decisões lidas.`);
  console.table(summaryRows);
}
