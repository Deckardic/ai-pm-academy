type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Structured data for search engines and AI assistants (SEO + GEO). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
