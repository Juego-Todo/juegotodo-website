import { rulebooks } from "@/data/rules";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(title: string, lines: string[]) {
  const contentLines = [
    "BT",
    "/F1 18 Tf",
    `72 750 Td (${escapePdfText(title)}) Tj`,
    "0 -28 Td",
    "/F1 11 Tf",
    ...lines.flatMap((line, index) => {
      const yOffset = index === 0 ? "" : "0 -16 Td ";
      return [`${yOffset}(${escapePdfText(line)}) Tj`];
    }),
    "ET",
  ].join("\n");

  const stream = contentLines;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export function generateRulebookPdf(slug: string) {
  const book = rulebooks.find((entry) => entry.slug === slug || entry.pdfHref.endsWith(`${slug}.pdf`));
  if (!book) {
    return null;
  }

  const lines = [
    book.summary,
    "",
    "Match rounds:",
    ...book.rounds,
    "",
    "Allowed actions:",
    ...book.allowed.slice(0, 8),
    "",
    "Prohibited actions:",
    ...book.prohibited.slice(0, 8),
    "",
    "Generated from the official Juego Todo rules hub.",
  ];

  return buildSimplePdf(book.title, lines);
}
