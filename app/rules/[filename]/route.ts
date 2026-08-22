import { generateRulebookPdf } from "@/lib/rules/pdf";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const slug = filename.replace(/\.pdf$/i, "").replace(/^juego-todo-/, "").replace(/-rules$/, "");

  const pdf = generateRulebookPdf(slug === "official" ? "official-rules" : slug);
  if (!pdf) {
    return new Response("Rulebook not found.", { status: 404 });
  }

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
