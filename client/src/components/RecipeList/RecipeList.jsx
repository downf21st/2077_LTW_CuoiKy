import { useState } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const FILTER_OPTIONS = ['Tất cả', 'Chiên', 'Xào', 'Nấu', 'Luộc'];

export default function RecipeList({ recipes = [] }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  return (
    <section className="recipe-list" aria-labelledby="daily-recipes-heading">
      <div className="recipe-list__header">
        <h2 id="daily-recipes-heading" className="recipe-list__title">
          Món ăn trong ngày
        </h2>

        <div className="filter-bar" role="group" aria-label="Bộ lọc loại món">
          {FILTER_OPTIONS.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`filter-bar__chip ${isActive ? 'filter-bar__chip--active' : ''}`}
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {recipes.length > 0 ? (
        <ul className="recipe-list__grid">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="recipe-list__item">
              <RecipeCard {...recipe} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="recipe-list__empty">Không tìm thấy món phù hợp.</p>
      )}
    </section>
  );
}