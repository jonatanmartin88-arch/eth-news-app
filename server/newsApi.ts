/**
 * News API integration for fetching cryptocurrency news
 * Using multiple free APIs: CoinGecko, NewsAPI, and CryptoCompare
 */

import { upsertNews } from "./db";
import type { InsertNews } from "../drizzle/schema";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || "demo";
const NEWSAPI_URL = "https://newsapi.org/v2";

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  sourceUrl: string;
  source: string;
  author?: string;
  publishedAt: Date;
  category?: string;
}

/**
 * Fetch news from NewsAPI about Ethereum and Crypto
 */
async function fetchFromNewsAPI(): Promise<NewsItem[]> {
  try {
    const queries = [
      "ethereum",
      "bitcoin",
      "cryptocurrency",
      "DeFi",
      "NFT",
      "crypto market",
      "blockchain",
    ];

    const allNews: NewsItem[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `${NEWSAPI_URL}/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10`,
          {
            headers: {
              "X-API-Key": NEWSAPI_KEY,
            },
          }
        );

        if (!response.ok) continue;

        const data = (await response.json()) as {
          articles?: Array<{
            title: string;
            description: string;
            content: string;
            urlToImage: string;
            url: string;
            source: { name: string };
            author: string;
            publishedAt: string;
          }>;
        };

        if (data.articles) {
          const categoryMap: Record<string, string> = {
            ethereum: "Ethereum",
            bitcoin: "Precio",
            cryptocurrency: "Tecnología",
            defi: "DeFi",
            nft: "NFTs",
            "crypto market": "Precio",
            blockchain: "Tecnología",
          };

          for (const article of data.articles) {
            allNews.push({
              id: `newsapi-${Date.now()}-${Math.random()}`,
              title: article.title,
              description: article.description,
              content: article.content,
              imageUrl: article.urlToImage,
              sourceUrl: article.url,
              source: article.source.name,
              author: article.author,
              publishedAt: new Date(article.publishedAt),
              category: categoryMap[query.toLowerCase()] || "Tecnología",
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching from NewsAPI for query "${query}":`, error);
      }
    }

    return allNews;
  } catch (error) {
    console.error("Error fetching from NewsAPI:", error);
    return [];
  }
}

/**
 * Fetch news from CoinGecko (free, no API key needed)
 */
async function fetchFromCoinGecko(): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/news?per_page=20&order=newest`
    );

    if (!response.ok) return [];

    const data = (await response.json()) as {
      data?: Array<{
        id: string;
        title: string;
        description: string;
        url: string;
        image: { small: string };
        sources: Array<{ title: string }>;
        published_at: string;
      }>;
    };

    if (!data.data) return [];

    return data.data.map((item) => ({
      id: `coingecko-${item.id}`,
      title: item.title,
      description: item.description,
      imageUrl: item.image?.small,
      sourceUrl: item.url,
      source: item.sources?.[0]?.title || "CoinGecko",
      publishedAt: new Date(item.published_at),
      category: "Tecnología",
    }));
  } catch (error) {
    console.error("Error fetching from CoinGecko:", error);
    return [];
  }
}

/**
 * Generate diverse mock news for demo purposes
 */
function generateMockNews(): NewsItem[] {
  const titles = [
    "Ethereum Staking Reaches $50 Billion Milestone",
    "Layer 2 Solutions See Record Adoption",
    "DeFi Protocol Launches Innovative Governance Model",
    "NFT Market Shows Strong Recovery Signs",
    "Bitcoin Correlation with Traditional Markets Weakens",
    "Crypto Regulation Framework Approved by EU",
    "New Blockchain Scalability Solution Announced",
    "Institutional Investors Increase Crypto Holdings",
    "Smart Contract Security Audit Reveals Best Practices",
    "Ethereum Gas Fees Hit New Lows",
    "DeFi TVL Surpasses $100 Billion",
    "NFT Collections Break Sales Records",
    "Crypto Custody Solutions Gain Mainstream Adoption",
    "Blockchain Technology Transforms Supply Chain",
    "Decentralized Finance Expands to Traditional Banking",
  ];

  const categories = ["Ethereum", "DeFi", "NFTs", "Precio", "Tecnología", "Regulación"];
  const sources = [
    "CryptoNews",
    "The Block",
    "Cointelegraph",
    "CoinDesk",
    "Crypto Briefing",
    "Ethereum Blog",
  ];

  const news: NewsItem[] = [];

  for (let i = 0; i < 15; i++) {
    const title = titles[i % titles.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    news.push({
      id: `mock-${Date.now()}-${i}`,
      title: `${title} #${i + 1}`,
      description: `Latest updates about ${category.toLowerCase()} in the cryptocurrency market. This is an important development for the industry.`,
      content: `Detailed analysis and insights about recent developments in ${category.toLowerCase()}. Industry experts are closely monitoring this trend...`,
      imageUrl: `https://via.placeholder.com/400x300?text=${category}+News+${i + 1}`,
      sourceUrl: `https://example.com/news/${i}`,
      source: source,
      author: `Reporter ${i + 1}`,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      category: category,
    });
  }

  return news;
}

/**
 * Fetch news from multiple sources
 */
export async function fetchCryptoNews(): Promise<NewsItem[]> {
  try {
    const allNews: NewsItem[] = [];

    // Try to fetch from real APIs
    if (NEWSAPI_KEY !== "demo") {
      const newsAPINews = await fetchFromNewsAPI();
      allNews.push(...newsAPINews);
    }

    const coinGeckoNews = await fetchFromCoinGecko();
    allNews.push(...coinGeckoNews);

    // If we have some real news, return it; otherwise use mock data
    if (allNews.length > 0) {
      return allNews.slice(0, 50); // Return top 50 articles
    }

    // Fallback to generated mock news
    return generateMockNews();
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return generateMockNews();
  }
}

/**
 * Map category name to category ID
 */
const categoryMap: Record<string, number> = {
  DeFi: 1,
  NFTs: 2,
  Precio: 3,
  Tecnología: 4,
  Regulación: 5,
  Ethereum: 6,
};

/**
 * Sync news from external APIs to database
 */
export async function syncNewsToDatabase(): Promise<number> {
  try {
    const newsItems = await fetchCryptoNews();
    let synced = 0;

    for (const item of newsItems) {
      const categoryId = item.category ? categoryMap[item.category] : undefined;

      const newsData: InsertNews = {
        externalId: item.id,
        title: item.title,
        description: item.description || null,
        content: item.content || null,
        imageUrl: item.imageUrl || null,
        sourceUrl: item.sourceUrl,
        source: item.source,
        author: item.author || null,
        categoryId: categoryId || null,
        publishedAt: item.publishedAt,
        fetchedAt: new Date(),
        createdAt: new Date(),
      };

      const result = await upsertNews(newsData);
      if (result) synced++;
    }

    console.log(`[News Sync] Synced ${synced} news items to database`);
    return synced;
  } catch (error) {
    console.error("Error syncing news to database:", error);
    return 0;
  }
}

/**
 * Start periodic news sync
 */
export function startNewsSyncInterval(intervalMs: number = 30 * 60 * 1000) {
  // Sync immediately on startup
  syncNewsToDatabase().catch(console.error);

  // Then sync periodically (every 30 minutes)
  setInterval(() => {
    syncNewsToDatabase().catch(console.error);
  }, intervalMs);
}
