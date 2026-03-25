import { Heart, Clock } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [timeAgo, setTimeAgo] = useState("");

  // Update time ago every minute
  useEffect(() => {
    const updateTime = () => {
      if (!news.publishedAt) {
        setTimeAgo("");
        return;
      }

      const now = new Date();
      const diff = now.getTime() - new Date(news.publishedAt).getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (minutes < 1) {
        setTimeAgo("Ahora mismo");
      } else if (minutes < 60) {
        setTimeAgo(`Hace ${minutes}m`);
      } else if (hours < 24) {
        setTimeAgo(`Hace ${hours}h`);
      } else if (days < 7) {
        setTimeAgo(`Hace ${days}d`);
      } else {
        setTimeAgo(new Date(news.publishedAt).toLocaleDateString("es-ES"));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [news.publishedAt]);

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

        {/* Time Badge */}
        {timeAgo && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-medium text-white">
            <Clock size={12} />
            <span>{timeAgo}</span>
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
            {news.publishedAt
              ? new Date(news.publishedAt).toLocaleDateString("es-ES")
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
