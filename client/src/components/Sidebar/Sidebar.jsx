import { NavLink, useMatch } from "react-router-dom";
import homeIcon from "../../assets/sidebar/home.svg";
import recipeIcon from "../../assets/sidebar/category.svg";
import cookingIcon from "../../assets/sidebar/cooking.svg";
import loginIcon from "../../assets/sidebar/signin.svg";
import avatarIcon from "../../assets/sidebar/avatar.svg";
import toggleIcon from "../../assets/sidebar/toggle.svg";
import "./Sidebar.css";

const ICONS = { home: homeIcon, recipe: recipeIcon, cooking: cookingIcon, login: loginIcon };

function Icon({ name, className }) {
  return <img className={`${className} ${className}--${name}`} src={ICONS[name]} alt="" aria-hidden="true" />;
}

function NavItem({ to, icon, label, end, onNavigate }) {
  const content = (
    <>
      <span className="nav-item__arrow" aria-hidden="true">›</span>
      <Icon name={icon} className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
    </>
  );

 
  if (!to) {
    return (
      <span className="nav-item nav-item--disabled" role="link" aria-disabled="true" title="Vui lòng chọn 1 món ăn trước">
        {content}
      </span>
    );
  }
  return <NavLink to={to} end={end} className="nav-item" onClick={onNavigate}>{content}</NavLink>;
}

function SidebarToggle({ isOpen, onClick, toggleRef }) {
  return (
    <button type="button" className="sidebar__toggle desktop-only" ref={toggleRef} onClick={onClick} aria-expanded={isOpen}>
      <img className={isOpen ? "sidebar__toggle-icon sidebar__toggle-icon--open" : "sidebar__toggle-icon"} src={toggleIcon} alt="" aria-hidden="true" />
    </button>
  );
}

function Sidebar({ isOpen, onToggle, onClose, toggleRef }) {
  
  const recipeMatch = useMatch("/recipe/:id");
  const cookingMatch = useMatch("/recipe/:id/cooking-mode");
  const matchedId = recipeMatch?.params.id ?? cookingMatch?.params.id;
  const recipeId = matchedId === "create" ? undefined : matchedId;
  
  
  const recipePath = recipeId ? `/recipe/${encodeURIComponent(recipeId)}` : undefined;
  const cookingPath = recipePath ? `${recipePath}/cooking-mode` : undefined;
  
  const handleNavigate = () => {
    if (window.innerWidth <= 600 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar__overlay" onClick={onClose}></div>}
      
      <div className={isOpen ? "sidebar sidebar--open" : "sidebar"}>
        <aside id="sidebar-panel" className="sidebar__panel" inert={!isOpen ? "" : undefined}>
          
          <div className="sidebar__mobile-header">
            
            <h2 className="sidebar__mobile-title">Menu</h2>
            <button className="sidebar__mobile-close" onClick={onClose}>Đóng</button>
          </div>

          <div className="sidebar__role">
            <img className="sidebar__avatar" src={avatarIcon} alt="" aria-hidden="true" />
            <span>Khách</span>
          </div>

          <nav className="sidebar__nav" aria-label="Menu chính">
            <NavItem to="/" end icon="home" label="Trang chủ" onNavigate={handleNavigate} />
            <NavItem to={recipePath} end icon="recipe" label="Chi tiết món ăn" onNavigate={handleNavigate} />
            <NavItem to={cookingPath} end icon="cooking" label="Khu vực nấu ăn" onNavigate={handleNavigate} />
          </nav>

          
          <div className="sidebar__login">
            <NavItem to="/login" icon="login" label="Đăng nhập / Đăng kí" onNavigate={handleNavigate} />
          </div>
        </aside>

        <SidebarToggle isOpen={isOpen} onClick={onToggle} toggleRef={toggleRef} />
      </div>
    </>
  );
}

export default Sidebar;