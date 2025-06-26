import { Poppler } from "node-poppler"; // npm i node-poppler

async function main() {
  const poppler = new Poppler();
  await poppler.pdfToHtml("input.pdf", "out.html"); // keeps fonts + images
}

main();
