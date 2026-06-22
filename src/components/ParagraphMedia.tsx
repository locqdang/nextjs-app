import Image from 'next/image';

type MediaFormat = {
  url?: string;
  width?: number;
  height?: number;
};

type Media = MediaFormat & {
  alternativeText?: string | null;
  formats?: Record<string, MediaFormat>;
};

type ParagraphMediaBlock = {
  type?: string | null;
  altText?: string | null;
  caption?: string | null;
  media?: Media | null;
};

type ParagraphMediaProps = {
  mediaBlock?: ParagraphMediaBlock | null;
};

export default function ParagraphMedia({ mediaBlock }: ParagraphMediaProps) {
  const media = mediaBlock?.media;
  const imageUrl = media?.formats?.large?.url ?? media?.formats?.medium?.url ?? media?.url;

  if (!imageUrl || mediaBlock?.type === 'video') return null;

  return (
    <figure className="blog-post__media">
      <Image
        src={imageUrl}
        alt={mediaBlock?.altText || media?.alternativeText || mediaBlock?.caption || ''}
        width={media?.formats?.large?.width ?? media?.width ?? 1000}
        height={media?.formats?.large?.height ?? media?.height ?? 650}
        sizes="(max-width: 768px) 100vw, 820px"
      />
      {mediaBlock?.caption ? <figcaption>{mediaBlock.caption}</figcaption> : null}
    </figure>
  );
}
