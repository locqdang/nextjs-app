import Image from 'next/image';
import { isExternalUrl, normalizeLinkUrl } from '../lib/security';

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
        const profileLink = normalizeLinkUrl(author.profile_link);
        const isExternalProfileLink = profileLink ? isExternalUrl(profileLink) : false;
        const nameNode = profileLink && isExternalProfileLink ? (
          <a href={profileLink} target="_blank" rel="nofollow noopener noreferrer">
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
              {showBio && profileLink && isExternalProfileLink ? (
                <a
                  className="blog-author__profile-link"
                  href={profileLink}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
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
