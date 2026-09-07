// ─── Live News RSS Ingestion Fetcher ───
// Fetches real-time geopolitical, energy, fertilizer, and macroeconomic news from open public RSS feeds.

import type { NewsArticle } from '../types';
import { FALLBACK_NEWS } from '../fallback';

// Robust text cleaner to strip CDATA, decode HTML entities, and remove all HTML tags / href fragments
export function cleanHtmlText(raw: string): string {
  if (!raw) return '';
  let content = raw.trim();

  // Strip CDATA wrapper if present
  if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
    content = content.slice(9, -3).trim();
  }

  // Iteratively decode HTML entities up to 3 times (handles double-encoded entities from RSS)
  for (let i = 0; i < 3; i++) {
    const prev = content;
    content = content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, dec) => {
        try {
          return String.fromCharCode(Number(dec));
        } catch {
          return '';
        }
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return '';
        }
      });
    if (content === prev) break;
  }

  // Strip all HTML tags
  content = content.replace(/<[^>]+>/gi, ' ');

  // Remove any leftover raw href/url/target attributes from malformed RSS descriptions
  content = content.replace(/\bhref=["'][^"']*["']/gi, ' ');
  content = content.replace(/\btarget=["'][^"']*["']/gi, ' ');
  content = content.replace(/https?:\/\/[^\s]+/gi, ' ');

  // Normalize whitespace
  content = content.replace(/\s+/g, ' ').trim();

  return content;
}

// Extract raw content between XML tags
function extractRawTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  let content = match[1].trim();
  if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
    content = content.slice(9, -3).trim();
  }
  return content;
}

// Extract link URL specifically without stripping http protocol
function extractLinkUrl(itemXml: string, fallbackUrl?: string): string {
  // Check <link> tag
  const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (linkMatch && linkMatch[1]) {
    let raw = linkMatch[1].trim();
    if (raw.startsWith('<![CDATA[') && raw.endsWith(']]>')) {
      raw = raw.slice(9, -3).trim();
    }
    raw = raw.replace(/&amp;/g, '&');
    if (raw.startsWith('http')) return raw;
  }

  // Check <link href="..." />
  const hrefMatch = itemXml.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (hrefMatch && hrefMatch[1]) {
    const raw = hrefMatch[1].trim().replace(/&amp;/g, '&');
    if (raw.startsWith('http')) return raw;
  }

  // Check <source url="..." />
  const sourceMatch = itemXml.match(/<source[^>]+url=["']([^"']+)["']/i);
  if (sourceMatch && sourceMatch[1]) {
    const raw = sourceMatch[1].trim().replace(/&amp;/g, '&');
    if (raw.startsWith('http')) return raw;
  }

  // Check <guid isPermaLink="true"> or any http guid
  const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
  if (guidMatch && guidMatch[1]) {
    let raw = guidMatch[1].trim();
    if (raw.startsWith('<![CDATA[') && raw.endsWith(']]>')) {
      raw = raw.slice(9, -3).trim();
    }
    raw = raw.replace(/&amp;/g, '&');
    if (raw.startsWith('http')) return raw;
  }

  if (fallbackUrl && fallbackUrl.startsWith('http')) {
    return fallbackUrl;
  }

  return 'https://news.google.com';
}

// Extract source domain or channel
function extractSource(link: string, rawSource: string): string {
  if (rawSource && rawSource.length > 1) return rawSource;
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, '');
    if (host && !host.includes('google.com')) return host;
  } catch {
    // ignore
  }
  return 'Global Risk Wire';
}

// Categorize region based on text keywords
function detectRegion(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes('indonesia') ||
    lower.includes('rupiah') ||
    lower.includes('jakarta') ||
    lower.includes('asean') ||
    lower.includes('lewotobi') ||
    lower.includes('marapi') ||
    lower.includes('ruang') ||
    lower.includes('semeru') ||
    lower.includes('sunda strait')
  ) {
    return 'Indonesia / Ring of Fire';
  }
  if (
    lower.includes('middle east') ||
    lower.includes('hormuz') ||
    lower.includes('red sea') ||
    lower.includes('yemen') ||
    lower.includes('iran') ||
    lower.includes('israel') ||
    lower.includes('gaza') ||
    lower.includes('suez') ||
    lower.includes('bab el-mandeb')
  ) {
    return 'Middle East / Chokepoints';
  }
  if (lower.includes('malacca') || lower.includes('singapore') || lower.includes('china') || lower.includes('beijing') || lower.includes('asia') || lower.includes('taiwan')) {
    return 'Asia-Pacific';
  }
  if (lower.includes('russia') || lower.includes('ukraine') || lower.includes('europe') || lower.includes('black sea')) {
    return 'Europe / Black Sea';
  }
  if (lower.includes('u.s.') || lower.includes('united states') || lower.includes('biden') || lower.includes('trump') || lower.includes('lng export') || lower.includes('panama')) {
    return 'Americas';
  }
  return 'Global';
}

// Generate smart tags based on topic keywords
function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (
    lower.includes('volcano') ||
    lower.includes('eruption') ||
    lower.includes('volcanic') ||
    lower.includes('ash') ||
    lower.includes('lewotobi') ||
    lower.includes('marapi') ||
    lower.includes('ruang') ||
    lower.includes('semeru') ||
    lower.includes('ring of fire') ||
    lower.includes('disaster')
  ) {
    tags.push('Volcano & Geohazard', 'Logistics');
  }
  if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('ammonia') || lower.includes('potash') || lower.includes('phosphate')) {
    tags.push('Fertilizer', 'Agriculture');
  }
  if (lower.includes('sulfur') || lower.includes('sulfuric') || lower.includes('feedstock')) {
    tags.push('Sulfur & Feedstock');
  }
  if (lower.includes('oil') || lower.includes('brent') || lower.includes('crude') || lower.includes('petroleum') || lower.includes('opec')) {
    tags.push('Energy', 'Crude Oil');
  }
  if (lower.includes('gas') || lower.includes('lng') || lower.includes('henry hub') || lower.includes('pipeline')) {
    tags.push('Natural Gas', 'Feedstock');
  }
  if (lower.includes('shipping') || lower.includes('red sea') || lower.includes('hormuz') || lower.includes('malacca') || lower.includes('suez') || lower.includes('strait') || lower.includes('vessel') || lower.includes('freight')) {
    tags.push('Shipping', 'Chokepoints');
  }
  if (lower.includes('inflation') || lower.includes('rate') || lower.includes('rupiah') || lower.includes('dollar') || lower.includes('tariff') || lower.includes('subsidy')) {
    tags.push('Macro & FX', 'Trade Policy');
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
  const highPriorityWords = [
    'urea', 'ammonia', 'fertilizer', 'brent', 'crude', 'natural gas', 
    'hormuz', 'red sea', 'bab el-mandeb', 'malacca', 'rupiah', 'phosphate', 
    'potash', 'sulfur', 'export restriction', 'sanction', 'volcano', 
    'eruption', 'lewotobi', 'marapi', 'ash cloud', 'flight cancel'
  ];
  for (const word of highPriorityWords) {
    if (lower.includes(word)) score += 4;
  }
  return Math.min(98, score);
}

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=volcano+eruption+indonesia+OR+"Mount+Lewotobi"+OR+"Mount+Marapi"+OR+"Mount+Ruang"+OR+"Ring+of+Fire"&hl=en-US&gl=US&ceid=US:en',
    fallbackSource: 'Volcano & Ring of Fire Alerts',
  },
  {
    url: 'https://news.google.com/rss/search?q="Strait+of+Hormuz"+OR+"Red+Sea"+OR+"Bab+el-Mandeb"+OR+"Malacca+Strait"+shipping&hl=en-US&gl=US&ceid=US:en',
    fallbackSource: 'Maritime Chokepoints Wire',
  },
  {
    url: 'https://oilprice.com/rss/main',
    fallbackSource: 'OilPrice.com',
  },
  {
    url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=CL=F,NG=F&region=US&lang=en-US',
    fallbackSource: 'Yahoo Finance Commodities',
  },
  {
    url: 'https://news.google.com/rss/search?q=fertilizer+OR+urea+OR+ammonia+OR+"natural+gas"+feedstock+OR+"phosphate+rock"&hl=en-US&gl=US&ceid=US:en',
    fallbackSource: 'Global Commodity Wire',
  },
  {
    url: 'https://www.eia.gov/rss/todayinenergy.xml',
    fallbackSource: 'U.S. EIA Today in Energy',
  },
  {
    url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    fallbackSource: 'UN News Global',
  },
];

export async function fetchLiveNews(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        next: { revalidate: 1800 }, // 30 min cache
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const xml = await res.text();
      const itemBlocks = xml.split('<item>').slice(1);

      for (const itemBlock of itemBlocks.slice(0, 6)) {
        const rawTitle = extractRawTag(itemBlock, 'title');
        const pubDateStr = extractRawTag(itemBlock, 'pubDate');
        const rawDesc = extractRawTag(itemBlock, 'description');
        const rawSource = extractRawTag(itemBlock, 'source');
        const sourceUrlMatch = itemBlock.match(/<source[^>]+url=["']([^"']+)["']/i);
        const sourceUrlAttr = sourceUrlMatch && sourceUrlMatch[1] ? sourceUrlMatch[1] : '';

        let cleanTitle = cleanHtmlText(rawTitle);
        if (!cleanTitle) continue;

        // Separate source name from Google News title if formatted as "Title - Source"
        let detectedSource = cleanHtmlText(rawSource);
        if (cleanTitle.includes(' - ')) {
          const parts = cleanTitle.split(' - ');
          const potentialSource = parts[parts.length - 1].trim();
          if (parts.length >= 2 && potentialSource.length < 40) {
            if (!detectedSource || potentialSource.toLowerCase() === detectedSource.toLowerCase()) {
              detectedSource = detectedSource || potentialSource;
              cleanTitle = parts.slice(0, -1).join(' - ').trim();
            }
          }
        }

        const rawLink = extractLinkUrl(itemBlock, sourceUrlAttr);
        const sourceName = detectedSource || extractSource(rawLink, feed.fallbackSource);
        const publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();

        let cleanSummary = cleanHtmlText(rawDesc);
        // If description is empty or just duplicate of title, create clean synthesis
        if (!cleanSummary || cleanSummary.length < 25 || cleanSummary.toLowerCase() === cleanTitle.toLowerCase()) {
          cleanSummary = `${cleanTitle} — Macro intelligence signal monitored for geopolitical and commodity risk impact.`;
        } else if (cleanSummary.length > 220) {
          cleanSummary = cleanSummary.slice(0, 220).trim() + '...';
        }

        const combinedText = `${cleanTitle} ${cleanSummary}`;
        const region = detectRegion(combinedText);
        const tags = detectTags(combinedText);
        const relevanceScore = calculateRelevance(combinedText);

        articles.push({
          id: `live-news-${articles.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
          title: cleanTitle,
          source: sourceName,
          sourceUrl: rawLink,
          publishedAt,
          region,
          tags,
          summary: cleanSummary,
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
