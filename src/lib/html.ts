const OG_TITLE_RE = /<meta[^>]+(?:property|name)=["']og:title["'][^>]*content=["']([^"']+)["']/i;

export const ogTitle = (html: string): string | undefined =>
  OG_TITLE_RE.exec(html)?.[1]?.trim() || undefined;
