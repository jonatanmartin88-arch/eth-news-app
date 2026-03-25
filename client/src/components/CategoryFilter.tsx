import type { Category } from "../../../drizzle/schema";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  isLoading?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading = false,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All button */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`category-btn whitespace-nowrap ${
          selectedCategoryId === null ? "active" : ""
        }`}
        disabled={isLoading}
      >
        Todas
      </button>

      {/* Category buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`category-btn whitespace-nowrap ${
            selectedCategoryId === category.id ? "active" : ""
          }`}
          disabled={isLoading}
          title={category.description || category.name}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
