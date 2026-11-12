import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_RECIPES } from '../data/mockRecipes';
import SearchBar from '../components/SearchBar/SearchBar';
import RecipeList from '../components/RecipeList/RecipeList';
import './Home.css';

export default function Home() {
  
  const [searchTags, setSearchTags] = useState([]);

  const featuredRecipe = MOCK_RECIPES[0] || {
    id: 'recipe-001',
    title: 'Phở bò tái',
    cookingTime: 90,
    difficulty: 'Trung bình',
    image: '',
  };

  const searchedRecipes = useMemo(() => {
    
    if (searchTags.length === 0) return MOCK_RECIPES;

    return MOCK_RECIPES.filter((recipe) => {
      
      return searchTags.every(tag => {
        const keyword = tag.value.toLowerCase();
        if (tag.type === 'ingredient') {
          return recipe.ingredients?.some((ing) =>
            ing.name.toLowerCase().includes(keyword)
          );
        } else {
          return (
            recipe.title.toLowerCase().includes(keyword) ||
            recipe.description?.toLowerCase().includes(keyword)
          );
        }
      });
    });
  }, [searchTags]);

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="home-hero__content">
          <p className="home-hero__kicker">
            <svg className="home-hero__kicker-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9.74 6.17499C8.955 4.13499 6.16 4.02499 6.835 1.05999C6.885 0.839994 6.65 0.669994 6.46 0.784994C4.645 1.85499 3.34 3.99999 4.435 6.80999C4.525 7.03999 4.255 7.25499 4.06 7.10499C3.155 6.41999 3.06 5.43499 3.14 4.72999C3.17 4.46999 2.83 4.34499 2.685 4.55999C2.345 5.07999 2 5.91999 2 7.18499C2.19 9.98499 4.555 10.845 5.405 10.955C6.62 11.11 7.935 10.885 8.88 10.02C9.92 9.05499 10.3 7.51499 9.74 6.17499ZM5.1 8.68999C5.82 8.51499 6.19 7.99499 6.29 7.53499C6.455 6.81999 5.81 6.11999 6.245 4.98999C6.41 5.92499 7.88 6.50999 7.88 7.52999C7.92 8.79499 6.55 9.87999 5.1 8.68999Z" fill="#DB8E69" />
            </svg>
            <span>Công thức hôm nay - {featuredRecipe.title}</span>
          </p>
          <h1 id="hero-heading" className="home-hero__title">
            <span className="home-hero__title-line">Cook</span>
            <span className="home-hero__title-line">something</span>
            <span className="home-hero__title-highlight">memorable</span>
            <span className="home-hero__title-line">today</span>
          </h1>
          <p className="home-hero__description">
            Cẩm nang nấu ăn tại gia — nơi tổng hợp các công thức nấu ăn viết bằng giọng điệu gần gũi như một người bạn trên bàn bếp.
          </p>
          <Link to={`/recipe/${featuredRecipe.id}`} className="home-hero__cta">
            Nấu ăn ngay <span className="home-hero__cta-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="home-hero__visual">
          <div className="home-hero__backdrop-card" aria-hidden="true" />
          <Link to={`/recipe/${featuredRecipe.id}`} className="home-hero__featured-card">
            <span className="home-hero__badge">CÔNG THỨC CỦA NGÀY</span>
            <div className="home-hero__featured-body">
              {featuredRecipe.image ? (
                <img src={featuredRecipe.image} alt={featuredRecipe.title} className="home-hero__featured-thumb" />
              ) : (
                <div className="home-hero__featured-thumb" />
              )}
              <div className="home-hero__featured-info">
                <p className="home-hero__featured-name">{featuredRecipe.title}</p>
                <p className="home-hero__featured-meta">
                  {featuredRecipe.cookingTime} phút · {featuredRecipe.difficulty}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      
      <SearchBar tags={searchTags} onTagsChange={setSearchTags} />
      
      <RecipeList recipes={searchedRecipes} />
    </div>
  );
}