import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Share2, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Streamdown } from "streamdown";

export default function NewsDetail() {
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // Extract news ID from URL
  const newsId = parseInt(location.split("/").pop() || "0");

  // Fetch news detail
  const { data: news, isLoading } = trpc.news.detail.useQuery(
    { id: newsId },
    { enabled: !!newsId }
  );

  // Check if favorite
  const { data: favoriteStatus, refetch: refetchFavoriteStatus } =
    trpc.news.isFavorite.useQuery(
      { newsId },
      { enabled: isAuthenticated && !!newsId }
    );

  // Add/remove favorite mutation
  const addFavoriteMutation = trpc.news.addFavorite.useMutation({
    onSuccess: () => {
      refetchFavoriteStatus();
    },
  });

  const removeFavoriteMutation = trpc.news.removeFavorite.useMutation({
    onSuccess: () => {
      refetchFavoriteStatus();
    },
  });

  useEffect(() => {
    setIsFavorite(favoriteStatus || false);
  }, [favoriteStatus]);

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isFavorite) {
      removeFavoriteMutation.mutate({ newsId });
    } else {
      addFavoriteMutation.mutate({ newsId });
    }
  };

  const handleShare = () => {
    if (news && navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description || news.title,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </Button>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Noticia no encontrada
            </h1>
            <p className="text-muted-foreground">
              La noticia que buscas no existe o ha sido eliminada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className={isFavorite ? "text-accent" : ""}
            >
              <Heart size={18} className={isFavorite ? "fill-current" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-3xl">
        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">{news.title}</h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="badge-source">{news.source}</span>
          </div>
          {news.author && (
            <div className="text-sm text-muted-foreground">
              Por <span className="font-medium">{news.author}</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {formatDate(news.publishedAt)}
          </div>
        </div>

        {/* Image */}
        {news.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Description */}
        {news.description && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {news.description}
          </p>
        )}

        {/* Content */}
        {news.content && (
          <div className="prose prose-invert max-w-none mb-8">
            <Streamdown>{news.content || ""}</Streamdown>
          </div>
        )}

        {/* Source Link */}
        {news.sourceUrl && (
          <div className="mt-8 pt-8 border-t border-border">
            <a
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Leer artículo completo
              <ExternalLink size={18} />
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
