import Image from 'next/image';

type BlogAuthorData = {
  id?: string | number;
  documentId?: string;
  title?: string;
  name?: string;
  bio?: string | null;
  profile_link?: string | null;
  photo?: {
    alternativeText?: string | null;
    url?: string;
    formats?: {
      thumbnail?: {
        url?: string;
      };
    };
  } | null;
};

type BlogAuthorProps = {
  authors?: BlogAuthorData[];
  compact?: boolean;
  showBio?: boolean;
};

export default function BlogAuthor({
  authors = [],
  compact = false,
  showBio = false,
}: BlogAuthorProps) {
  if (!authors.length) return null;

  return (
    <div className={compact ? 'blog-authors blog-authors--compact' : 'blog-authors'}>
      {authors.map((author) => {
        const photoUrl = author.photo?.formats?.thumbnail?.url ?? author.photo?.url;
        const name = author.name || author.title || 'Vietpolyglots';
        const nameNode = author.profile_link ? (
          <a href={author.profile_link} target="_blank" rel="noreferrer">
            {name}
          </a>
        ) : (
          name
        );
        const photoSize = compact ? 32 : showBio ? 64 : 44;

        return (
          <div className="blog-author" key={author.documentId ?? author.id ?? name}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={author.photo?.alternativeText || name}
                width={photoSize}
                height={photoSize}
                className="blog-author__photo"
              />
            ) : null}
            <div>
              <p className="blog-author__label">{showBio ? 'The author' : 'Written by'}</p>
              <p className="blog-author__name">{nameNode}</p>
              {showBio && author.bio ? <p className="blog-author__bio">{author.bio}</p> : null}
              {showBio && author.profile_link ? (
                <a
                  className="blog-author__profile-link"
                  href={author.profile_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View public profile
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
