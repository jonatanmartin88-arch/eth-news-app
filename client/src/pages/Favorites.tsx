import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function Favorites() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch user favorites
  const {
    data: userFavorites = [],
    isLoading,
    refetch: refetchFavorites,
  } = trpc.news.favorites.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated && !authLoading }
  );

  // Remove from favorites mutation
  const removeFavoriteMutation = trpc.news.removeFavorite.useMutation({
    onSuccess: () => {
      refetchFavorites();
    },
  });

  // Update favorites set
  useEffect(() => {
    const favoriteIds = new Set(userFavorites.map((fav) => fav.id));
    setFavorites(favoriteIds);
  }, [userFavorites]);

  // Handle favorite toggle (remove)
  const handleFavoriteToggle = (newsId: number) => {
    removeFavoriteMutation.mutate({ newsId });
  };

  // Handle news click
  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };

  // Redirect to home if not authenticated
  if (!isAuthenticated && !authLoading) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
              <p className="text-xs text-muted-foreground">
                {userFavorites.length} noticia{userFavorites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Heart size={24} className="text-accent" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : userFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💔</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sin favoritos aún
            </h2>
            <p className="text-muted-foreground mb-6">
              Agrega noticias a favoritos para verlas aquí
            </p>
            <Button onClick={() => navigate("/")}>
              Explorar noticias
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFavorites.map((newsItem) => (
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
