import { Client } from "@notionhq/client";

export { Client };

export function createNotionClient(apiKey?: string) {
  return new Client({
    auth: apiKey ?? process.env.NOTION_API_KEY,
    notionVersion: "2025-09-03",
  });
}

export const notion = createNotionClient();

/**
 * Extract plain text from a Notion rich_text array
 */
export function richTextToString(
  richText: Array<{ plain_text?: string }>
): string {
  return richText.map((t) => t.plain_text ?? "").join("");
}

/**
 * Recursively get all block content as plain text (useful for RAG context)
 */
export async function pageToPlainText(
  client: Client,
  pageId: string
): Promise<string> {
  const blocks = await client.blocks.children.list({ block_id: pageId });
  const lines: string[] = [];

  for (const block of blocks.results) {
    const b = block as any;
    const type: string = b.type;
    const content = b[type];

    if (content?.rich_text) {
      lines.push(richTextToString(content.rich_text));
    }
  }

  return lines.filter(Boolean).join("\n");
}
