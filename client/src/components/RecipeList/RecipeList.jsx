import { useState, useMemo } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'hard', label: 'Khó', match: 'khó' },
  { id: 'medium', label: 'Trung Bình', match: 'trung bình' },
  { id: 'easy', label: 'Dễ', match: 'dễ' },
];

export default function RecipeList({ recipes = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'all') return recipes;
    const target = DIFFICULTY_FILTERS.find((f) => f.id === activeFilter);
    if (!target) return recipes;

    return recipes.filter((recipe) => {
      const diff = (recipe.difficulty || '').toLowerCase().trim();
      return diff === target.match || diff === target.id;
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
          {filteredRecipes.map((recipe, index) => (
            <li
              key={recipe.id}
              className="recipe-list__item"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="recipe-list__empty">
          Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.
        </p>
      )}
    </section>
  );
}