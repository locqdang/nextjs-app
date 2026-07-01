import type { ParagraphRichTextContent } from '../components/ParagraphRichText';

type BlogParagraphLike = {
  id?: string | number;
  title?: string | null;
  richText?: ParagraphRichTextContent;
};

export type BlogTocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

function slugifyHeadingText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  return (node.children || []).map(extractText).join('');
}

function getHeadingText(block: any): string {
  return extractText(block).trim();
}

export function createHeadingId(text: string, usedIds?: Map<string, number>): string {
  const base = slugifyHeadingText(text) || 'section';

  if (!usedIds) return base;

  const count = usedIds.get(base) ?? 0;
  usedIds.set(base, count + 1);

  return count === 0 ? base : `${base}-${count + 1}`;
}

export function extractBlogTocItems(paragraphs: BlogParagraphLike[] = []): BlogTocItem[] {
  const items: BlogTocItem[] = [];
  const usedIds = new Map<string, number>();

  for (const paragraph of paragraphs) {
    const sectionTitle = paragraph.title?.trim();
    if (sectionTitle) {
      items.push({
        id: createHeadingId(sectionTitle, usedIds),
        text: sectionTitle,
        level: 2,
      });
    }

    for (const block of paragraph.richText || []) {
      if (block?.type !== 'heading') continue;

      const text = getHeadingText(block);
      if (!text) continue;

      const rawLevel = Number(block.level) || 3;
      const level = Math.min(Math.max(rawLevel, 3), 4) as 3 | 4;

      items.push({
        id: createHeadingId(text, usedIds),
        text,
        level,
      });
    }
  }

  return items;
}
