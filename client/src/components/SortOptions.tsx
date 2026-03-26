import { Button } from "@/components/ui/button";
import { ArrowDown, TrendingUp, Clock } from "lucide-react";

interface SortOptionsProps {
  sortBy: "recent" | "oldest" | "trending";
  onSortChange: (sort: "recent" | "oldest" | "trending") => void;
}

export function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Ordenar por:</span>
      <div className="flex gap-2">
        <Button
          variant={sortBy === "recent" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("recent")}
          className="flex items-center gap-1"
        >
          <Clock size={16} />
          Más recientes
        </Button>
        <Button
          variant={sortBy === "oldest" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("oldest")}
          className="flex items-center gap-1"
        >
          <ArrowDown size={16} />
          Más antiguas
        </Button>
        <Button
          variant={sortBy === "trending" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("trending")}
          className="flex items-center gap-1"
        >
          <TrendingUp size={16} />
          Trending
        </Button>
      </div>
    </div>
  );
}
