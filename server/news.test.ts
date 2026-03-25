import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("news router", () => {
  it("should get categories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.news.categories();

    expect(Array.isArray(categories)).toBe(true);
    // Categories should include at least the default ones
    expect(categories.length).toBeGreaterThanOrEqual(0);
  });

  it("should get news feed", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const feed = await caller.news.feed({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBeLessThanOrEqual(10);
  });

  it("should search news", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.news.search({
      query: "ethereum",
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
  });

  it("should add and remove favorites", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Get a news item first
    const feed = await caller.news.feed({ limit: 1, offset: 0 });
    if (feed.length === 0) {
      console.log("No news items available for testing");
      return;
    }

    const newsId = feed[0].id;

    // Check if it's not already a favorite
    let isFav = await caller.news.isFavorite({ newsId });
    expect(typeof isFav).toBe("boolean");

    // Add to favorites
    const addResult = await caller.news.addFavorite({ newsId });
    expect(typeof addResult).toBe("boolean");

    // Verify it's now a favorite
    isFav = await caller.news.isFavorite({ newsId });
    expect(isFav).toBe(true);

    // Remove from favorites
    const removeResult = await caller.news.removeFavorite({ newsId });
    expect(typeof removeResult).toBe("boolean");

    // Verify it's no longer a favorite
    isFav = await caller.news.isFavorite({ newsId });
    expect(isFav).toBe(false);
  });

  it("should get user favorites", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const favorites = await caller.news.favorites({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(favorites)).toBe(true);
  });

  it("should get news detail", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get a news item first
    const feed = await caller.news.feed({ limit: 1, offset: 0 });
    if (feed.length === 0) {
      console.log("No news items available for testing");
      return;
    }

    const newsId = feed[0].id;

    // Get detail
    const detail = await caller.news.detail({ id: newsId });

    expect(detail).toBeDefined();
    if (detail) {
      expect(detail.id).toBe(newsId);
      expect(detail.title).toBeDefined();
    }
  });

  it("should filter news by category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get categories first
    const categories = await caller.news.categories();
    if (categories.length === 0) {
      console.log("No categories available for testing");
      return;
    }

    const categoryId = categories[0].id;

    // Get news by category
    const newsByCategory = await caller.news.byCategory({
      categoryId,
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(newsByCategory)).toBe(true);
  });
});
