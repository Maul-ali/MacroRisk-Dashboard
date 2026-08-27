// ─── Live News RSS Ingestion Fetcher ───
// Fetches real-time geopolitical, energy, fertilizer, and macroeconomic news from open public RSS feeds.

import type { NewsArticle } from '../types';
import { FALLBACK_NEWS } from '../fallback';

// Extract text between XML tags cleanly
function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  let content = match[1].trim();
  // Strip CDATA wrapper if present
  if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
    content = content.slice(9, -3).trim();
  }
  // Strip inner HTML tags
  content = content.replace(/<[^>]+>/g, '').trim();
  // Decode common HTML entities
  content = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return content;
}

// Extract source domain or channel
function extractSource(link: string, rawSource: string): string {
  if (rawSource && rawSource.length > 2) return rawSource;
  try {
    const url = new URL(link);
    return url.hostname.replace('www.', '');
  } catch {
    return 'Global News Wire';
  }
}

// Categorize region based on text keywords
function detectRegion(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('indonesia') || lower.includes('rupiah') || lower.includes('jakarta') || lower.includes('asean')) {
    return 'Indonesia';
  }
  if (
    lower.includes('middle east') ||
    lower.includes('hormuz') ||
    lower.includes('red sea') ||
    lower.includes('yemen') ||
    lower.includes('iran') ||
    lower.includes('israel') ||
    lower.includes('gaza') ||
    lower.includes('suez')
  ) {
    return 'Middle East';
  }
  if (lower.includes('china') || lower.includes('beijing') || lower.includes('asia')) {
    return 'Asia-Pacific';
  }
  if (lower.includes('russia') || lower.includes('ukraine') || lower.includes('europe') || lower.includes('black sea')) {
    return 'Europe / Black Sea';
  }
  if (lower.includes('u.s.') || lower.includes('united states') || lower.includes('biden') || lower.includes('trump') || lower.includes('lng export')) {
    return 'North America';
  }
  return 'Global';
}

// Generate smart tags based on topic keywords
function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('ammonia') || lower.includes('potash') || lower.includes('phosphate')) {
    tags.push('Fertilizer', 'Agriculture');
  }
  if (lower.includes('oil') || lower.includes('brent') || lower.includes('crude') || lower.includes('petroleum') || lower.includes('opec')) {
    tags.push('Energy', 'Crude Oil');
  }
  if (lower.includes('gas') || lower.includes('lng') || lower.includes('henry hub') || lower.includes('feedstock')) {
    tags.push('Natural Gas', 'Feedstock');
  }
  if (lower.includes('shipping') || lower.includes('red sea') || lower.includes('strait') || lower.includes('vessel') || lower.includes('freight')) {
    tags.push('Shipping', 'Supply Chain');
  }
  if (lower.includes('inflation') || lower.includes('rate') || lower.includes('rupiah') || lower.includes('dollar') || lower.includes('tariff')) {
    tags.push('Macroeconomics', 'FX');
  }

  if (tags.length === 0) {
    tags.push('Macro Intelligence', 'Policy');
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

// Calculate relevance score for the fertilizer and macro risk radar
function calculateRelevance(text: string): number {
  const lower = text.toLowerCase();
  let score = 75;
  const highPriorityWords = ['urea', 'ammonia', 'fertilizer', 'brent', 'crude', 'natural gas', 'hormuz', 'red sea', 'rupiah', 'phosphate', 'export restriction', 'sanction'];
  for (const word of highPriorityWords) {
    if (lower.includes(word)) score += 4;
  }
  return Math.min(98, score);
}

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=fertilizer+OR+urea+OR+ammonia+OR+"natural+gas"+OR+"brent+crude"+OR+"red+sea"+shipping&hl=en-US&gl=US&ceid=US:en',
    fallbackSource: 'Global Commodity & Energy Wire',
  },
  {
    url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    fallbackSource: 'UN News Global',
  },
  {
    url: 'https://www.eia.gov/rss/todayinenergy.xml',
    fallbackSource: 'U.S. EIA Today in Energy',
  },
];

export async function fetchLiveNews(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 1800 }, // 30 min cache
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const xml = await res.text();
      const itemBlocks = xml.split('<item>').slice(1);

      for (const itemBlock of itemBlocks.slice(0, 8)) {
        const title = extractTag(itemBlock, 'title');
        const link = extractTag(itemBlock, 'link');
        const pubDateStr = extractTag(itemBlock, 'pubDate');
        const rawDesc = extractTag(itemBlock, 'description');
        const rawSource = extractTag(itemBlock, 'source');

        if (!title) continue;

        const combinedText = `${title} ${rawDesc}`;
        const sourceName = rawSource || extractSource(link, feed.fallbackSource);
        const publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
        const region = detectRegion(combinedText);
        const tags = detectTags(combinedText);
        const relevanceScore = calculateRelevance(combinedText);
        const summary = rawDesc.length > 20 ? rawDesc.slice(0, 220) + (rawDesc.length > 220 ? '...' : '') : `${title} - Macro intelligence signal for risk monitoring.`;

        articles.push({
          id: `live-news-${articles.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
          title,
          source: sourceName,
          sourceUrl: link || 'https://news.google.com',
          publishedAt,
          region,
          tags,
          summary,
          relevanceScore,
        });
      }
    } catch {
      // Continue with other feeds
    }
  }

  // If live RSS feeds return articles, sort by recency and relevance
  if (articles.length >= 5) {
    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  // Gracefully fallback to seed articles if offline
  return FALLBACK_NEWS;
}
