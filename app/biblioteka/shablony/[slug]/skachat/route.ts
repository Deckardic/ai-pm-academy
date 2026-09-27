import { getTemplate } from "@/entities/template/index.server";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/biblioteka/shablony/[slug]/skachat">,
) {
  const template = getTemplate((await params).slug);
  if (!template) return new Response("Not found", { status: 404 });
  return new Response(`${template.body}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template.slug}.md"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
