/** Quebra um texto em linhas que cabem na largura dada. Respeita as quebras de linha (\n) do texto. */
export function wrapTextIntoLines(drawingContext, text, maximumLineWidthInPixels) {
  return text.split("\n").flatMap((paragraph) => wrapParagraphIntoLines(drawingContext, paragraph, maximumLineWidthInPixels));
}

function wrapParagraphIntoLines(drawingContext, paragraph, maximumLineWidthInPixels) {
  if (paragraph.trim() === "") {
    return [""];
  }

  const wrappedLines = [];
  let currentLine = "";
  paragraph.split(" ").forEach((word) => {
    const candidateLine = currentLine === "" ? word : `${currentLine} ${word}`;
    const candidateFits = drawingContext.measureText(candidateLine).width <= maximumLineWidthInPixels;
    if (candidateFits || currentLine === "") {
      currentLine = candidateLine;
      return;
    }
    wrappedLines.push(currentLine);
    currentLine = word;
  });
  wrappedLines.push(currentLine);
  return wrappedLines;
}
