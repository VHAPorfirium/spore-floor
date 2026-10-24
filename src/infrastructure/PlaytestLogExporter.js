import { summarizeDecisionsByAnomaly } from "../application/DecisionLog.js";

/** Salva o log de decisões como arquivo JSON e mostra o resumo no console do navegador. */
export class PlaytestLogExporter {
  constructor(gameVersion) {
    this.gameVersion = gameVersion;
  }

  createPlaytestLogContent(decisionRecords) {
    return {
      game: "Spore Floor",
      gameVersion: this.gameVersion,
      exportedAt: new Date().toISOString(),
      decisions: decisionRecords,
      summaryByAnomaly: summarizeDecisionsByAnomaly(decisionRecords),
    };
  }

  printSummaryToConsole(decisionRecords) {
    console.info(`Spore Floor playtest: ${decisionRecords.length} decisions`);
    console.table(summarizeDecisionsByAnomaly(decisionRecords));
  }

  downloadAsJsonFile(decisionRecords) {
    const playtestLogContent = this.createPlaytestLogContent(decisionRecords);
    const playtestLogText = JSON.stringify(playtestLogContent, null, 2);
    const fileNameSafeTimestamp = playtestLogContent.exportedAt.replace(/[:.]/g, "-");

    const playtestLogFile = new Blob([playtestLogText], { type: "application/json" });
    const temporaryDownloadUrl = URL.createObjectURL(playtestLogFile);
    const temporaryDownloadLink = document.createElement("a");
    temporaryDownloadLink.href = temporaryDownloadUrl;
    temporaryDownloadLink.download = `spore-floor-playtest-${fileNameSafeTimestamp}.json`;
    document.body.appendChild(temporaryDownloadLink);
    temporaryDownloadLink.click();
    temporaryDownloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(temporaryDownloadUrl), 1000);

    // Se o download for bloqueado (por exemplo dentro de um iframe), o resumo continua no console.
    this.printSummaryToConsole(decisionRecords);
  }
}
