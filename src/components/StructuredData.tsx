type JsonLdValue = Record<string, unknown> | unknown[];

type StructuredDataProps = {
  data?: string | JsonLdValue | null;
};

function normalizeStructuredData(data: StructuredDataProps['data']): JsonLdValue | null {
  if (!data) return null;

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown;
      return typeof parsed === 'object' && parsed !== null ? (parsed as JsonLdValue) : null;
    } catch {
      return null;
    }
  }

  if (typeof data === 'object') return data;

  return null;
}

export default function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = normalizeStructuredData(data);

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
