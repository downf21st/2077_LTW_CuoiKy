import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation, useMatch, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import homeIcon from "../../assets/sidebar/home.svg";
import recipeIcon from "../../assets/sidebar/category.svg";
import cookingIcon from "../../assets/sidebar/cooking.svg";
import loginIcon from "../../assets/sidebar/signin.svg";
import avatarIcon from "../../assets/sidebar/avatar.svg";
import toggleIcon from "../../assets/sidebar/toggle.svg";
import dashboardIcon from "../../assets/sidebar/dashboard.svg";
import addIcon from "../../assets/sidebar/add.svg";
import "./Sidebar.css";

const ICONS = {
  home: homeIcon,
  recipe: recipeIcon,
  cooking: cookingIcon,
  login: loginIcon,
  logout: loginIcon,
  dashboard: dashboardIcon,
  add: addIcon,
};

function Icon({ name, className }) {
  return (
    <img
      className={`${className} ${className}--${name}`}
      src={ICONS[name] || ICONS.home}
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
  onClick,
}) {
  const content = (
    <>
      <Icon name={icon} className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
    </>
  );

  if (!to && onClick) {
    return (
      <button
        type="button"
        className="nav-item nav-item--button"
        data-sidebar-item={icon}
        onClick={(e) => {
          onClick(e);
          if (onNavigate) onNavigate();
        }}
        onMouseEnter={() => setHover(icon)}
        onMouseLeave={() => setHover(null)}
        onFocus={(event) =>
          setFocused(event.currentTarget.matches(":focus-visible") ? icon : null)
        }
        onBlur={() => setFocused(null)}
      >
        {content}
      </button>
    );
  }

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

function getAvatarInitial(name, email) {
  const cleanedName = String(name || "").trim();
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }
  const cleanedEmail = String(email || "").trim();
  return cleanedEmail ? cleanedEmail.charAt(0).toUpperCase() : "U";
}

function Sidebar({ isOpen, onToggle, onClose, toggleRef }) {
  const panelRef = useRef(null);
  const arrowRef = useRef(null);
  const [hoveredItem, setHover] = useState(null);
  const [focusedItem, setFocused] = useState(null);
  const preview = hoveredItem || focusedItem;

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

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

  useEffect(() => {
    if (!isOpen || typeof onClose !== "function") return;

    const handleOutsidePointerDown = (event) => {
      const target = event.target;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (toggleRef?.current && toggleRef.current.contains(target)) return;
      if (target instanceof Element && target.closest(".sidebar__toggle")) return;
      onClose();
    };

    document.addEventListener("mousedown", handleOutsidePointerDown);
    document.addEventListener("touchstart", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointerDown);
      document.removeEventListener("touchstart", handleOutsidePointerDown);
    };
  }, [isOpen, onClose, toggleRef]);

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

  const handleLogout = () => {
    logout();
    navigate("/");
    handleNavigate();
  };

  let displayName = "Khách";
  if (user?.name || user?.fullName) {
    displayName = user.name || user.fullName;
  } else if (role === "admin") {
    displayName = "Admin";
  } else if (role === "member") {
    displayName = "Member";
  }

  const avatarInitial = getAvatarInitial(
    user?.name || user?.fullName,
    user?.email
  );

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
            {user?.avatar ? (
              <img
                className="sidebar__avatar sidebar__avatar--photo"
                src={user.avatar}
                alt={displayName}
              />
            ) : user ? (
              <span
                className="sidebar__avatar sidebar__avatar--initial"
                aria-hidden="true"
              >
                {avatarInitial}
              </span>
            ) : (
              <img
                className="sidebar__avatar"
                src={avatarIcon}
                alt=""
                aria-hidden="true"
              />
            )}
            <span>{displayName}</span>
          </div>

          <nav className="sidebar__nav" aria-label="Menu chính">
            {role === "admin" && (
              <div className="sidebar__group">
                <div className="sidebar__group-header">
                  <Icon name="dashboard" className="nav-item__icon" />
                  <span className="nav-item__label">Bảng điều khiển Admin</span>
                </div>
                <div className="sidebar__group-list">
                  <NavLink to="/admin/dashboard" className="sidebar__sub-item" onClick={handleNavigate}>
                    Tổng quan & Thống kê
                  </NavLink>
                  <NavLink to="/admin/pending-recipes" className="sidebar__sub-item" onClick={handleNavigate}>
                    Duyệt công thức
                  </NavLink>
                  <NavLink to="/admin/categories" className="sidebar__sub-item" onClick={handleNavigate}>
                    Quản lý loại món
                  </NavLink>
                  <NavLink to="/admin/comments" className="sidebar__sub-item" onClick={handleNavigate}>
                    Quản lý bình luận
                  </NavLink>
                </div>
              </div>
            )}

            {role === "member" && (
              <div className="sidebar__group">
                <div className="sidebar__group-header">
                  <Icon name="dashboard" className="nav-item__icon" />
                  <span className="nav-item__label">Bảng điều khiển cá nhân</span>
                </div>
                <div className="sidebar__group-list">
                  <NavLink to="/my-account/profile" className="sidebar__sub-item" onClick={handleNavigate}>
                    Thông tin cá nhân
                  </NavLink>
                  <NavLink to="/my-account/my-recipes" className="sidebar__sub-item" onClick={handleNavigate}>
                    Công thức của tôi
                  </NavLink>
                  <NavLink to="/my-account/favorites" className="sidebar__sub-item" onClick={handleNavigate}>
                    Món yêu thích
                  </NavLink>
                  <NavLink to="/my-account/weekly-menu" className="sidebar__sub-item" onClick={handleNavigate}>
                    Thực đơn tuần và đi chợ
                  </NavLink>
                </div>
              </div>
            )}

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

            {(role === "member" || role === "admin") && (
              <NavItem
                to="/recipe/create"
                icon="add"
                label="Thêm món ăn"
                onNavigate={handleNavigate}
                preview={preview}
                setHover={setHover}
                setFocused={setFocused}
              />
            )}
          </nav>

          <div className="sidebar__login">
            {user ? (
              <NavItem
                onClick={handleLogout}
                icon="logout"
                label="Đăng xuất"
                preview={preview}
                setHover={setHover}
                setFocused={setFocused}
              />
            ) : (
              <NavItem
                to="/login"
                icon="login"
                label="Đăng nhập / Đăng kí"
                onNavigate={handleNavigate}
                preview={preview}
                setHover={setHover}
                setFocused={setFocused}
              />
            )}
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
