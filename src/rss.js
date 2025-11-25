/**
 * RSS Feed Generator
 * Converts JSON feed items to RSS 2.0 XML format
 */

/**
 * Escapes special XML characters
 * @param {string} str - String to escape
 * @returns {string} XML-safe string
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats a date to RFC 822 format (required by RSS)
 * @param {string|Date} date - Date to format
 * @returns {string} RFC 822 formatted date
 */
function toRfc822(date) {
  const d = new Date(date);
  return d.toUTCString();
}

/**
 * Gets a display title for a feed item
 * @param {Object} item - Feed item
 * @returns {string} Title string
 */
function getItemTitle(item) {
  // Use first 80 chars of content as title, or create one from source/author
  if (item.content) {
    const text = item.content.replace(/\s+/g, ' ').trim();
    if (text.length > 80) {
      return text.substring(0, 77) + '...';
    }
    return text;
  }
  return `${item.source} post by ${item.author}`;
}

/**
 * Gets the source display name
 * @param {string} source - Source identifier
 * @returns {string} Display name
 */
function getSourceName(source) {
  const names = {
    twitter: 'Twitter/X',
    reddit: 'Reddit',
    github: 'GitHub'
  };
  return names[source] || source;
}

/**
 * Generates an RSS item XML element
 * @param {Object} item - Feed item
 * @returns {string} RSS item XML
 */
function generateItem(item) {
  const title = escapeXml(getItemTitle(item));
  const link = escapeXml(item.url);
  const author = escapeXml(item.author);
  const source = getSourceName(item.source);
  const category = item.category ? escapeXml(item.category) : 'uncategorized';
  const pubDate = toRfc822(item.timestamp);
  const guid = escapeXml(item.id);

  // Build description with metadata
  let description = `<![CDATA[`;
  description += `<p><strong>Author:</strong> ${item.author}</p>`;
  description += `<p><strong>Source:</strong> ${source}</p>`;
  if (item.category) {
    description += `<p><strong>Category:</strong> ${item.category}</p>`;
  }
  description += `<hr/>`;
  description += `<p>${item.content || ''}</p>`;

  // Add metadata for Twitter
  if (item.source === 'twitter' && item.metadata) {
    description += `<hr/>`;
    description += `<p><small>`;
    description += `Likes: ${item.metadata.likes || 0} | `;
    description += `Retweets: ${item.metadata.retweets || 0} | `;
    description += `Replies: ${item.metadata.replies || 0}`;
    description += `</small></p>`;
  }

  description += `]]>`;

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <author>${author}</author>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
      <source url="${link}">${escapeXml(source)}</source>
    </item>`;
}

/**
 * Generates a complete RSS 2.0 feed from feed items
 * @param {Array} items - Array of feed items
 * @param {Object} options - Feed options
 * @param {string} options.title - Feed title
 * @param {string} options.link - Feed link
 * @param {string} options.description - Feed description
 * @returns {string} Complete RSS XML
 */
function generateRssFeed(items, options = {}) {
  const title = escapeXml(options.title || 'Factory AI Social Feed');
  const link = escapeXml(options.link || 'https://factory.ai');
  const description = escapeXml(options.description || 'Aggregated mentions from Twitter, Reddit, and GitHub');
  const lastBuildDate = toRfc822(new Date());

  const itemsXml = items.map(item => generateItem(item)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${link}</link>
    <description>${description}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Factory AI Feed Scraper</generator>
    <ttl>10</ttl>
${itemsXml}
  </channel>
</rss>`;
}

module.exports = {
  generateRssFeed,
  escapeXml,
  toRfc822
};
