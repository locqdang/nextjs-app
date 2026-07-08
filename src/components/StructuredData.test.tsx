import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import StructuredData from './StructuredData';

describe('StructuredData', () => {
  it('escapes hostile JSON-LD so script termination payloads stay inert', () => {
    const html = renderToStaticMarkup(
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          dangerous: '</script><script>alert(1)</script>',
        }}
      />
    );

    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect((html.match(/<script/g) || []).length).toBe(1);
  });

  it('returns nothing for invalid JSON strings', () => {
    const html = renderToStaticMarkup(<StructuredData data={'{"invalid":'} />);

    expect(html).toBe('');
  });
});