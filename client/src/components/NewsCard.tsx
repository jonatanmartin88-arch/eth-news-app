import { Heart } from "lucide-react";
import { useState } from "react";
import type { News } from "../../../drizzle/schema";

interface NewsCardProps {
  news: News;
  isFavorite?: boolean;
  onFavoriteToggle?: (newsId: number) => void;
  onClick?: () => void;
}

export function NewsCard({
  news,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}: NewsCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Hace poco";
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return new Date(date).toLocaleDateString("es-ES");
  };

  return (
    <div
      className="news-card"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {news.imageUrl ? (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="news-card-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20">
            <div className="text-center">
              <div className="text-4xl mb-2">📰</div>
              <p className="text-muted-foreground text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(news.id);
            }}
            className={`absolute top-3 right-3 btn-favorite ${
              isFavorite ? "active" : ""
            }`}
            title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-current" : ""}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="news-card-content">
        {/* Title */}
        <h3 className="news-card-title">{news.title}</h3>

        {/* Description */}
        {news.description && (
          <p className="news-card-description">{news.description}</p>
        )}

        {/* Meta Information */}
        <div className="news-card-meta">
          <div className="flex items-center gap-2">
            {news.source && (
              <span className="badge-source">{news.source}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(news.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
