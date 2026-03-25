/**
 * News API integration for fetching cryptocurrency news
 * Using CoinGecko API and other free sources
 */

import { upsertNews } from "./db";
import type { InsertNews } from "../drizzle/schema";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CRYPTOPANIC_API = "https://cryptopanic.com/api/v1/posts";

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
 * Fetch news from CryptoNews API (free tier)
 * This is a mock implementation - in production you'd use a real API
 */
export async function fetchCryptoNews(): Promise<NewsItem[]> {
  try {
    // Using NewsAPI free tier or similar
    // For now, returning mock data structure
    const mockNews: NewsItem[] = [
      {
        id: "eth-1",
        title: "Ethereum Layer 2 Solutions See Record Growth",
        description: "Arbitrum and Optimism see unprecedented adoption rates",
        content:
          "Layer 2 solutions for Ethereum continue to attract developers and users...",
        imageUrl: "https://via.placeholder.com/400x300?text=Ethereum+Layer2",
        sourceUrl: "https://example.com/eth-layer2",
        source: "CryptoNews",
        author: "John Doe",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60),
        category: "Tecnología",
      },
      {
        id: "defi-1",
        title: "DeFi TVL Reaches New Milestone",
        description: "Total Value Locked in DeFi protocols surpasses $100B",
        content: "The DeFi ecosystem continues to grow with new protocols...",
        imageUrl: "https://via.placeholder.com/400x300?text=DeFi+Growth",
        sourceUrl: "https://example.com/defi-tvl",
        source: "DeFi Pulse",
        author: "Jane Smith",
        publishedAt: new Date(Date.now() - 2000 * 60 * 60),
        category: "DeFi",
      },
      {
        id: "nft-1",
        title: "NFT Market Shows Signs of Recovery",
        description: "Trading volume increases as new collections launch",
        content: "The NFT market is experiencing renewed interest...",
        imageUrl: "https://via.placeholder.com/400x300?text=NFT+Market",
        sourceUrl: "https://example.com/nft-recovery",
        source: "NFT Insider",
        author: "Mike Johnson",
        publishedAt: new Date(Date.now() - 3000 * 60 * 60),
        category: "NFTs",
      },
      {
        id: "price-1",
        title: "Ethereum Price Analysis: Key Levels to Watch",
        description: "Technical analysis shows potential breakout",
        content: "Ethereum has been consolidating around key support levels...",
        imageUrl: "https://via.placeholder.com/400x300?text=ETH+Price",
        sourceUrl: "https://example.com/eth-analysis",
        source: "TradingView",
        author: "Alex Chen",
        publishedAt: new Date(Date.now() - 4000 * 60 * 60),
        category: "Precio",
      },
      {
        id: "tech-1",
        title: "Ethereum Dencun Upgrade: What Changed",
        description: "Proto-danksharding brings significant improvements",
        content: "The Dencun upgrade introduces several important changes...",
        imageUrl: "https://via.placeholder.com/400x300?text=Dencun+Upgrade",
        sourceUrl: "https://example.com/dencun",
        source: "Ethereum Blog",
        author: "Vitalik Buterin",
        publishedAt: new Date(Date.now() - 5000 * 60 * 60),
        category: "Ethereum",
      },
    ];

    return mockNews;
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
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

    return synced;
  } catch (error) {
    console.error("Error syncing news to database:", error);
    return 0;
  }
}

/**
 * Start periodic news sync
 */
export function startNewsSyncInterval(intervalMs: number = 5 * 60 * 1000) {
  // Sync immediately on startup
  syncNewsToDatabase().catch(console.error);

  // Then sync periodically
  setInterval(() => {
    syncNewsToDatabase().catch(console.error);
  }, intervalMs);
}
