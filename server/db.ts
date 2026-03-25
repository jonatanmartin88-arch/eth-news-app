import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { categories, favorites, InsertNews, InsertUser, news, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories);
}

export async function getNewsFeed(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(news)
    .orderBy((n) => desc(n.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getNewsByCategory(categoryId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(news)
    .where(eq(news.categoryId, categoryId))
    .orderBy((n) => desc(n.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function searchNews(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${query}%`;
  return await db
    .select()
    .from(news)
    .where(
      or(
        like(news.title, searchTerm),
        like(news.description, searchTerm),
        like(news.content, searchTerm)
      )
    )
    .orderBy((n) => desc(n.publishedAt))
    .limit(limit);
}

export async function getNewsById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserFavorites(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: news.id,
      externalId: news.externalId,
      title: news.title,
      description: news.description,
      content: news.content,
      imageUrl: news.imageUrl,
      sourceUrl: news.sourceUrl,
      source: news.source,
      author: news.author,
      categoryId: news.categoryId,
      publishedAt: news.publishedAt,
      fetchedAt: news.fetchedAt,
      createdAt: news.createdAt,
      savedAt: favorites.savedAt,
    })
    .from(favorites)
    .innerJoin(news, eq(favorites.newsId, news.id))
    .where(eq(favorites.userId, userId))
    .orderBy((f) => desc(f.savedAt))
    .limit(limit)
    .offset(offset);
}

export async function isFavorite(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.newsId, newsId)))
    .limit(1);
  return result.length > 0;
}

export async function addFavorite(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(favorites).values({ userId, newsId });
    return true;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return false;
  }
}

export async function removeFavorite(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.newsId, newsId)));
    return true;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return false;
  }
}

export async function upsertNews(newsData: any) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(news).values(newsData).onDuplicateKeyUpdate({
      set: {
        title: newsData.title,
        description: newsData.description,
        content: newsData.content,
        imageUrl: newsData.imageUrl,
        sourceUrl: newsData.sourceUrl,
        source: newsData.source,
        author: newsData.author,
        publishedAt: newsData.publishedAt,
        fetchedAt: new Date(),
      },
    });
    const result = await db
      .select()
      .from(news)
      .where(eq(news.externalId, newsData.externalId))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("Failed to upsert news:", error);
    return undefined;
  }
}

// TODO: add feature queries here as your schema grows.
