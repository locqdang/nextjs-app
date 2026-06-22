import ParagraphMedia from './ParagraphMedia';
import ParagraphRichText from './ParagraphRichText';

type BlogParagraphData = {
  id?: string | number;
  title?: string | null;
  richText?: Parameters<typeof ParagraphRichText>[0]['content'];
  ParagraphMedia?: Parameters<typeof ParagraphMedia>[0]['mediaBlock'];
};

type BlogParagraphProps = {
  paragraph: BlogParagraphData;
};

export default function BlogParagraph({ paragraph }: BlogParagraphProps) {
  return (
    <section className="blog-post__section">
      {paragraph.title ? <h2>{paragraph.title}</h2> : null}
      <ParagraphMedia mediaBlock={paragraph.ParagraphMedia} />
      <ParagraphRichText content={paragraph.richText} />
    </section>
  );
}
