import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
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

function NavItem({
  to,
  icon,
  label,
  end,
  onNavigate,
  preview,
  setHover,
  setFocused,
}) {
  const content = (
    <>
      <Icon name={icon} className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
    </>
  );

  if (!to) {
    return (
      <span
        className="nav-item nav-item--disabled"
        role="link"
        aria-disabled="true"
        title="Vui lòng chọn 1 món ăn trước"
      >
        {content}
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      data-sidebar-item={icon}
      className={({ isActive }) =>
        `nav-item${(preview ? preview === icon : isActive) ? " nav-item--indented" : ""}`
      }
      onClick={onNavigate}
      onMouseEnter={() => setHover(icon)}
      onMouseLeave={() => setHover(null)}
      onFocus={(event) =>
        setFocused(event.currentTarget.matches(":focus-visible") ? icon : null)
      }
      onBlur={() => setFocused(null)}
    >
      {content}
    </NavLink>
  );
}

function SidebarToggle({ isOpen, onClick, toggleRef }) {
  return (
    <button
      type="button"
      className="sidebar__toggle desktop-only"
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
  const panelRef = useRef(null);
  const arrowRef = useRef(null);
  const [hoveredItem, setHover] = useState(null);
  const [focusedItem, setFocused] = useState(null);
  const preview = hoveredItem || focusedItem;
  const { pathname } = useLocation();

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
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const arrow = arrowRef.current;
    const updateArrow = () => {
      const target = preview
        ? panel.querySelector(`[data-sidebar-item="${preview}"]`)
        : panel.querySelector('.nav-item[aria-current="page"]');
      if (!target) {
        arrow.style.visibility = "hidden";
        return;
      }
      const panelRect = panel.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(target).paddingLeft);
      arrow.style.transform = `translate(${targetRect.left - panelRect.left + padding + 1}px, ${targetRect.top - panelRect.top + targetRect.height / 2 - arrow.offsetHeight / 2}px)`;
      arrow.style.visibility = "visible";
    };
    updateArrow();
    window.addEventListener("resize", updateArrow);
    panel.addEventListener("scroll", updateArrow, true);
    const observer = new ResizeObserver(updateArrow);
    observer.observe(panel);
    panel
      .querySelectorAll(".nav-item")
      .forEach((item) => observer.observe(item));
    return () => {
      window.removeEventListener("resize", updateArrow);
      panel.removeEventListener("scroll", updateArrow, true);
      observer.disconnect();
    };
  }, [pathname, preview, isOpen, recipePath]);

  const handleNavigate = () => {
    if (window.innerWidth <= 600 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar__overlay" onClick={onClose}></div>}

      <div className={isOpen ? "sidebar sidebar--open" : "sidebar"}>
        <aside
          id="sidebar-panel"
          className={`sidebar__panel${preview ? " sidebar__panel--previewing" : ""}`}
          ref={panelRef}
          inert={!isOpen}
        >
          <span className="sidebar__arrow" ref={arrowRef} aria-hidden="true">
            ›
          </span>

          <div className="sidebar__mobile-header">
            <h2 className="sidebar__mobile-title">Menu</h2>
            <button
              type="button"
              className="sidebar__mobile-close"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>

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
              preview={preview}
              setHover={setHover}
              setFocused={setFocused}
            />
            <NavItem
              to={recipePath}
              end
              icon="recipe"
              label="Chi tiết món ăn"
              onNavigate={handleNavigate}
              preview={preview}
              setHover={setHover}
              setFocused={setFocused}
            />
            <NavItem
              to={cookingPath}
              end
              icon="cooking"
              label="Khu vực nấu ăn"
              onNavigate={handleNavigate}
              preview={preview}
              setHover={setHover}
              setFocused={setFocused}
            />
          </nav>

          <div className="sidebar__login">
            <NavItem
              to="/login"
              icon="login"
              label="Đăng nhập / Đăng kí"
              onNavigate={handleNavigate}
              preview={preview}
              setHover={setHover}
              setFocused={setFocused}
            />
          </div>
        </aside>

        <SidebarToggle
          isOpen={isOpen}
          onClick={onToggle}
          toggleRef={toggleRef}
        />
      </div>
    </>
  );
}

export default Sidebar;
