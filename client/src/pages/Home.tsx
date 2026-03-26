import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { NewsCard } from "@/components/NewsCard";
import { SearchBar } from "@/components/SearchBar";
import { SortOptions } from "@/components/SortOptions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, Heart, RefreshCw } from "lucide-react";
import type { News } from "../../../drizzle/schema";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedNews, setDisplayedNews] = useState<News[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "trending">("recent");
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.news.categories.useQuery();

  // Fetch news feed
  const {
    data: feedNews = [],
    isLoading: isFeedLoading,
    refetch: refetchFeed,
  } = trpc.news.feed.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !searchQuery && !selectedCategoryId }
  );

  // Fetch news by category
  const {
    data: categoryNews = [],
    isLoading: isCategoryLoading,
  } = trpc.news.byCategory.useQuery(
    { categoryId: selectedCategoryId!, limit: 20, offset: 0 },
    { enabled: !!selectedCategoryId && !searchQuery }
  );

  // Search news
  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
  } = trpc.news.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: !!searchQuery }
  );

  // Fetch user favorites
  const {
    data: userFavorites = [],
    refetch: refetchFavorites,
  } = trpc.news.favorites.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated && !authLoading }
  );

  // Add to favorites mutation
  const addFavoriteMutation = trpc.news.addFavorite.useMutation({
    onSuccess: () => {
      refetchFavorites();
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = trpc.news.removeFavorite.useMutation({
    onSuccess: () => {
      refetchFavorites();
    },
  });

  // Update displayed news based on search/category/feed and apply sorting
  useEffect(() => {
    let news: News[] = [];
    if (searchQuery) {
      news = searchResults;
    } else if (selectedCategoryId) {
      news = categoryNews;
    } else {
      news = feedNews;
    }

    // Apply sorting
    const sorted = [...news].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
      } else if (sortBy === "trending") {
        // For trending, we can use a simple heuristic: newer news with more engagement
        // In a real app, this would be based on actual engagement metrics
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      }
      return 0;
    });

    setDisplayedNews(sorted);
  }, [searchQuery, searchResults, selectedCategoryId, categoryNews, feedNews, sortBy]);

  // Update favorites set
  useEffect(() => {
    const favoriteIds = new Set(userFavorites.map((fav) => fav.id));
    setFavorites(favoriteIds);
  }, [userFavorites]);

  // Manual refresh handler - wrapped in useCallback to prevent dependency issues
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchFeed().finally(() => setIsRefreshing(false));
  }, [refetchFeed]);

  // Auto-refresh feed every 5 minutes - only depends on search/category, not refetchFeed
  useEffect(() => {
    if (!searchQuery && !selectedCategoryId) {
      // Set initial interval
      refreshIntervalRef.current = setInterval(() => {
        setIsRefreshing(true);
        refetchFeed().finally(() => setIsRefreshing(false));
      }, 5 * 60 * 1000); // 5 minutes
    }

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [searchQuery, selectedCategoryId]); // Only depend on these, not refetchFeed

  // Handle favorite toggle
  const handleFavoriteToggle = (newsId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (favorites.has(newsId)) {
      removeFavoriteMutation.mutate({ newsId });
    } else {
      addFavoriteMutation.mutate({ newsId });
    }
  };

  // Handle news click
  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };

  const isLoading = isFeedLoading || isCategoryLoading || isSearchLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ETH News</h1>
                <p className="text-xs text-muted-foreground">
                  {isRefreshing ? "Actualizando..." : "Noticias en tiempo real"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Actualizar noticias"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/favorites")}
                  className="flex items-center gap-2"
                >
                  <Heart size={18} />
                  <span className="hidden sm:inline">Favoritos</span>
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{user?.name || "Perfil"}</span>
                  <span className="sm:hidden">👤</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={setSearchQuery}
            isLoading={isLoading}
            placeholder="Buscar noticias sobre Ethereum, DeFi, NFTs..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            isLoading={isLoading}
          />
        </div>

        {/* Sort Options */}
        <div className="mb-8">
          <SortOptions sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* News Grid */}
        {isLoading && displayedNews.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : displayedNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No hay noticias
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No se encontraron resultados para tu búsqueda"
                : "Intenta seleccionar otra categoría"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedNews.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                isFavorite={favorites.has(newsItem.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => handleNewsClick(newsItem.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
