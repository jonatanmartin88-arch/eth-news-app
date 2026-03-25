import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCategories,
  getNewsFeed,
  getNewsByCategory,
  searchNews,
  getNewsById,
  getUserFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  news: router({
    // Get all categories
    categories: publicProcedure.query(async () => {
      return await getCategories();
    }),

    // Get news feed with pagination
    feed: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return await getNewsFeed(input.limit, input.offset);
      }),

    // Get news by category
    byCategory: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return await getNewsByCategory(input.categoryId, input.limit, input.offset);
      }),

    // Search news
    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        return await searchNews(input.query, input.limit);
      }),

    // Get news detail
    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getNewsById(input.id);
      }),

    // Check if news is favorite (requires auth)
    isFavorite: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await isFavorite(ctx.user.id, input.newsId);
      }),

    // Add to favorites
    addFavorite: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await addFavorite(ctx.user.id, input.newsId);
      }),

    // Remove from favorites
    removeFavorite: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await removeFavorite(ctx.user.id, input.newsId);
      }),

    // Get user's favorite news
    favorites: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        return await getUserFavorites(ctx.user.id, input.limit, input.offset);
      }),
  }),
});

export type AppRouter = typeof appRouter;
