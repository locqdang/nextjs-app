import Image from 'next/image';

type MediaFormat = {
  url?: string;
  width?: number;
  height?: number;
};

type CoverImage = MediaFormat & {
  alternativeText?: string | null;
  caption?: string | null;
  formats?: Record<string, MediaFormat>;
};

type BlogCoverImageProps = {
  title: string;
  coverImage?: CoverImage | null;
};

export default function BlogCoverImage({ title, coverImage }: BlogCoverImageProps) {
  const imageUrl = coverImage?.formats?.large?.url ?? coverImage?.formats?.medium?.url ?? coverImage?.url;

  if (!imageUrl) return null;

  return (
    <figure className="blog-post__cover">
      <Image
        src={imageUrl}
        alt={coverImage?.alternativeText || title}
        width={coverImage?.formats?.large?.width ?? coverImage?.width ?? 1200}
        height={coverImage?.formats?.large?.height ?? coverImage?.height ?? 675}
        sizes="(max-width: 900px) 100vw, 860px"
        priority
      />
      {coverImage?.caption ? <figcaption>{coverImage.caption}</figcaption> : null}
    </figure>
  );
}
