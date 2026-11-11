import { NavLink, useMatch } from "react-router-dom";
import homeIcon from "../../assets/sidebar/home.svg";
import recipeIcon from "../../assets/sidebar/category.svg";
import cookingIcon from "../../assets/sidebar/cooking.svg";
import loginIcon from "../../assets/sidebar/signin.svg";
import avatarIcon from "../../assets/sidebar/avatar.svg";
import toggleIcon from "../../assets/sidebar/toggle.svg";
import "./Sidebar.css";

const ICONS = {
  home: homeIcon,
  recipe: recipeIcon,
  cooking: cookingIcon,
  login: loginIcon,
};

function Icon({ name, className }) {
  return (
    <img
      className={`${className} ${className}--${name}`}
      src={ICONS[name]}
      alt=""
      aria-hidden="true"
    />
  );
}

function NavItem({ to, icon, label, end, onNavigate }) {
  const content = (
    <>
      <span className="nav-item__arrow" aria-hidden="true">
        ›
      </span>
      <Icon name={icon} className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
    </>
  );

  if (!to) {
    return (
      <span
        className="nav-item"
        role="link"
        aria-disabled="true"
        aria-label={`${label}, chưa có trang đích`}
        title="Chưa có trang đích"
      >
        {content}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className="nav-item"
      title={label}
      onClick={onNavigate}
    >
      {content}
    </NavLink>
  );
}

function SidebarToggle({ isOpen, onClick, toggleRef }) {
  return (
    <button
      type="button"
      className="sidebar__toggle"
      ref={toggleRef}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="sidebar-panel"
      aria-label={isOpen ? "Đóng menu" : "Mở menu"}
    >
      <img
        className={
          isOpen
            ? "sidebar__toggle-icon sidebar__toggle-icon--open"
            : "sidebar__toggle-icon"
        }
        src={toggleIcon}
        alt=""
        aria-hidden="true"
      />
    </button>
  );
}

function Sidebar({ isOpen, onToggle, onClose, toggleRef }) {
  const recipeMatch = useMatch("/recipe/:id");
  const cookingMatch = useMatch("/recipe/:id/cooking-mode");
  const matchedId = recipeMatch?.params.id ?? cookingMatch?.params.id;
  const recipeId = matchedId === "create" ? undefined : matchedId;
  const recipePath = recipeId
    ? `/recipe/${encodeURIComponent(recipeId)}`
    : undefined;
  const cookingPath = recipePath
    ? `${recipePath}/cooking-mode`
    : "/cooking-mode-emty";
  const handleNavigate = (event) => {
    if (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      onClose();
    }
  };
  return (
    <div className={isOpen ? "sidebar sidebar--open" : "sidebar"}>
      <aside id="sidebar-panel" className="sidebar__panel" inert={!isOpen}>
        <div className="sidebar__role">
          <img
            className="sidebar__avatar"
            src={avatarIcon}
            alt=""
            aria-hidden="true"
          />
          <span>Khách</span>
        </div>

        <nav className="sidebar__nav" aria-label="Menu chính">
          <NavItem
            to="/"
            end
            icon="home"
            label="Trang chủ"
            onNavigate={handleNavigate}
          />
          <NavItem
            to={recipePath}
            end
            icon="recipe"
            label="Chi tiết món ăn"
            onNavigate={handleNavigate}
          />
          <NavItem
            to={cookingPath}
            end
            icon="cooking"
            label="Khu vực nấu ăn"
            onNavigate={handleNavigate}
          />
        </nav>

        <div className="sidebar__login">
          <NavItem
            to="/login"
            icon="login"
            label="Đăng nhập / Đăng kí"
            onNavigate={handleNavigate}
          />
        </div>
      </aside>

      <SidebarToggle isOpen={isOpen} onClick={onToggle} toggleRef={toggleRef} />
    </div>
  );
}

export default Sidebar;
