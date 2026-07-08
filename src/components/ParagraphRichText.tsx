import Link from 'next/link';
import type { ReactNode } from 'react';
import { isExternalUrl, normalizeLinkUrl } from '../lib/security';

export type RichTextChild = {
  type?: string;
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: RichTextChild[];
};

export type RichTextBlock = RichTextChild & {
  level?: number;
  format?: 'ordered' | 'unordered' | string;
};

export type ParagraphRichTextProps = {
  content?: RichTextBlock[] | null;
  headingIds?: string[];
};

export type ParagraphRichTextContent = ParagraphRichTextProps['content'];

function extractText(node?: RichTextChild | null): string {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  return (node.children || []).map(extractText).join('');
}

function renderInlineNode(child: RichTextChild, key: string): ReactNode {
  if (child.type === 'text') {
    let content: ReactNode = child.text;

    if (!content) return null;
    if (child.code) content = <code>{content}</code>;
    if (child.bold) content = <strong>{content}</strong>;
    if (child.italic) content = <em>{content}</em>;
    if (child.underline) content = <u>{content}</u>;
    if (child.strikethrough) content = <s>{content}</s>;

    return <span key={key}>{content}</span>;
  }

  if (child.type === 'link') {
    const href = normalizeLinkUrl(child.url);
    const linkChildren = renderTextChildren(child.children || [], `${key}-child`);

    if (!href) return <span key={key}>{linkChildren}</span>;

    if (isExternalUrl(href)) {
      return (
        <a key={key} href={href} target="_blank" rel="nofollow noopener noreferrer">
          {linkChildren}
        </a>
      );
    }

    return (
      <Link key={key} href={href}>
        {linkChildren}
      </Link>
    );
  }

  return null;
}

function renderTextChildren(children: RichTextChild[] = [], keyPrefix = 'inline'): ReactNode[] {
  return children.map((child, index) =>
    renderInlineNode(
      child,
      `${keyPrefix}-${child.type ?? 'node'}-${child.text ?? child.url ?? index}-${index}`
    )
  );
}

function blockText(block: RichTextBlock): string {
  return extractText(block).trim();
}

function renderList(block: RichTextBlock, index: number): ReactNode {
  const ListTag = block.format === 'ordered' ? 'ol' : 'ul';

  return (
    <ListTag key={`list-${index}`}>
      {(block.children || []).map((item, itemIndex) => (
        <li key={`list-item-${itemIndex}`}>
          {renderTextChildren(item.children, `list-item-${itemIndex}`)}
        </li>
      ))}
    </ListTag>
  );
}

function renderBlock(block: RichTextBlock, index: number, headingIds: string[] = []): ReactNode {
  if (!block) return null;

  if (block.type === 'paragraph') {
    if (!blockText(block)) return null;

    const onlyChild = block.children?.length === 1 ? block.children[0] : null;
    if (onlyChild?.code) {
      return (
        <pre key={`code-${index}`}>
          <code>{extractText(onlyChild)}</code>
        </pre>
      );
    }

    return (
      <p key={`paragraph-${index}`}>{renderTextChildren(block.children, `paragraph-${index}`)}</p>
    );
  }

  if (block.type === 'heading') {
    if (!blockText(block)) return null;
    const headingLevel = Math.min(Math.max(block.level || 3, 3), 4);
    const HeadingTag = `h${headingLevel}` as 'h3' | 'h4';
    const headingId = headingIds[index];
    return (
      <HeadingTag key={`heading-${index}`} id={headingId}>
        {renderTextChildren(block.children, `heading-${index}`)}
      </HeadingTag>
    );
  }

  if (block.type === 'quote') {
    if (!blockText(block)) return null;
    return (
      <blockquote key={`quote-${index}`}>
        {renderTextChildren(block.children, `quote-${index}`)}
      </blockquote>
    );
  }

  if (block.type === 'list') {
    return renderList(block, index);
  }

  return null;
}

export default function ParagraphRichText({ content, headingIds = [] }: ParagraphRichTextProps) {
  if (!Array.isArray(content) || !content.length) return null;

  return <>{content.map((block, index) => renderBlock(block, index, headingIds))}</>;
}
