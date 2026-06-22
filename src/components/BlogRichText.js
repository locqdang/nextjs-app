function renderTextChildren(children = []) {
  return children.map((child, index) => {
    if (child.type !== 'text') return null;

    let content = child.text;

    if (!content) return null;
    if (child.code) content = <code>{content}</code>;
    if (child.bold) content = <strong>{content}</strong>;
    if (child.italic) content = <em>{content}</em>;
    if (child.underline) content = <u>{content}</u>;
    if (child.strikethrough) content = <s>{content}</s>;

    return <span key={`${child.text}-${index}`}>{content}</span>;
  });
}

function blockText(block) {
  return (block.children || [])
    .map((child) => child.text || '')
    .join('')
    .trim();
}

function renderList(block, index) {
  const ListTag = block.format === 'ordered' ? 'ol' : 'ul';

  return (
    <ListTag key={`list-${index}`}>
      {(block.children || []).map((item, itemIndex) => (
        <li key={`list-item-${itemIndex}`}>{renderTextChildren(item.children)}</li>
      ))}
    </ListTag>
  );
}

function renderBlock(block, index) {
  if (!block) return null;

  if (block.type === 'paragraph') {
    if (!blockText(block)) return null;

    const onlyChild = block.children?.length === 1 ? block.children[0] : null;
    if (onlyChild?.code) {
      return (
        <pre key={`code-${index}`}>
          <code>{onlyChild.text}</code>
        </pre>
      );
    }

    return <p key={`paragraph-${index}`}>{renderTextChildren(block.children)}</p>;
  }

  if (block.type === 'heading') {
    if (!blockText(block)) return null;
    const HeadingTag = `h${Math.min(Math.max(block.level || 3, 3), 4)}`;
    return <HeadingTag key={`heading-${index}`}>{renderTextChildren(block.children)}</HeadingTag>;
  }

  if (block.type === 'quote') {
    if (!blockText(block)) return null;
    return <blockquote key={`quote-${index}`}>{renderTextChildren(block.children)}</blockquote>;
  }

  if (block.type === 'list') {
    return renderList(block, index);
  }

  return null;
}

export default function BlogRichText({ content }) {
  if (!Array.isArray(content) || !content.length) return null;

  return <>{content.map(renderBlock)}</>;
}
