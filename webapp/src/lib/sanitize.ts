import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Only allows safe tags for rendering markdown-style content.
 */
export function sanitizeHTML(html: string): string {
  // Only run DOMPurify on the client side
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags as a fallback
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h2', 'h3', 'strong', 'em', 'li', 'ul', 'ol', 'p', 'br'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Converts markdown-style report content to sanitized HTML.
 * Used for rendering AI-generated reports safely.
 */
export function markdownToSafeHTML(markdown: string): string {
  const html = markdown
    .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-lg font-semibold mt-8 mb-4">$1</h2>')
    .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-base font-medium mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-warm-800">$1</strong>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">');

  return sanitizeHTML(html);
}

/**
 * Converts markdown to safe HTML for PDF/HTML download.
 * Simpler conversion without Tailwind classes.
 */
export function markdownToDownloadHTML(markdown: string): string {
  const html = markdown
    .replace(/## /g, '<h2>')
    .replace(/### /g, '<h3>')
    .replace(/\*\*/g, '')
    .replace(/\n- /g, '<br>• ');

  return sanitizeHTML(html);
}
