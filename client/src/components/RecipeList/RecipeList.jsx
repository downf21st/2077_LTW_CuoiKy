import { useState, useMemo } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'Tất cả', matches: [] },
  { id: 'hard', label: 'Khó', matches: ['khó', 'kho', 'hard'] },
  {
    id: 'medium',
    label: 'Trung Bình',
    matches: ['trung bình', 'trung binh', 'medium'],
  },
  { id: 'easy', label: 'Dễ', matches: ['dễ', 'de', 'easy'] },
];

export default function RecipeList({ recipes = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'all') return recipes;
    const target = DIFFICULTY_FILTERS.find((f) => f.id === activeFilter);
    if (!target) return recipes;

    return recipes.filter((recipe) => {
      const diff = String(recipe?.difficulty || '').toLowerCase().trim();
      return target.matches.includes(diff);
    });
  }, [recipes, activeFilter]);

  return (
    <section className="recipe-list" aria-labelledby="daily-recipes-heading">
      <div className="recipe-list__header">
        <h2 id="daily-recipes-heading" className="recipe-list__title">
          Món ăn trong ngày
        </h2>

        <div
          className="filter-bar"
          role="group"
          aria-label="Lọc món ăn theo độ khó"
        >
          {DIFFICULTY_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                className={`filter-bar__chip ${
                  isActive ? 'filter-bar__chip--active' : ''
                }`}
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredRecipes.length > 0 ? (
        <ul className="recipe-list__grid">
          {filteredRecipes.map((recipe, index) => {
            const itemKey = recipe?._id || recipe?.id || `recipe-${index}`;
            return (
              <li
                key={itemKey}
                className="recipe-list__item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <RecipeCard recipe={recipe} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="recipe-list__empty">
          Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.
        </p>
      )}
    </section>
  );
}