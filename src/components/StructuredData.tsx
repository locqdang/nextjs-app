import { sanitizeStructuredDataJson } from '../lib/security';

type JsonLdValue = Record<string, unknown> | unknown[];

type StructuredDataProps = {
  data?: string | JsonLdValue | null;
  nonce?: string;
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

export default function StructuredData({ data, nonce }: StructuredDataProps) {
  const jsonLd = normalizeStructuredData(data);

  if (!jsonLd) return null;

  // Deliberate raw-script exception: JSON-LD stays inert because sanitizeStructuredDataJson
  // escapes script-breaking characters before the payload enters the script context.
  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeStructuredDataJson(jsonLd) }}
    />
  );
}
