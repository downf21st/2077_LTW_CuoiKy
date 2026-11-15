import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import "./Layout.css";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const layoutRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const layout = layoutRef.current;
    const footer = layout.querySelector(".footer");
    const panel = layout.querySelector(".sidebar__panel");
    const role = layout.querySelector(".sidebar__role");
    const nav = layout.querySelector(".sidebar__nav");
    const login = layout.querySelector(".sidebar__login");

    const updateSidebarBounds = () => {
      if (window.matchMedia("(max-width: 600px)").matches) return;
      const availableHeight = Math.max(
        0,
        document.documentElement.clientHeight - 6,
      );
      const minContentHeight =
        role.offsetHeight +
        login.offsetHeight +
        parseFloat(getComputedStyle(panel).paddingTop) +
        parseFloat(getComputedStyle(nav).marginTop);
      const minHeight = Math.min(minContentHeight, availableHeight);
      const footerTop = footer.getBoundingClientRect().top;
      const top = Math.min(3, footerTop - 3 - minHeight);
      const height = Math.max(
        0,
        Math.min(availableHeight, footerTop - top - 3),
      );
      layout.style.setProperty("--sidebar-top", `${top}px`);
      layout.style.setProperty("--sidebar-height", `${height}px`);
    };

    updateSidebarBounds();
    window.addEventListener("scroll", updateSidebarBounds, { passive: true });
    window.addEventListener("resize", updateSidebarBounds);
    const observer = new ResizeObserver(updateSidebarBounds);
    [layout, footer, role, login].forEach((node) => observer.observe(node));
    return () => {
      window.removeEventListener("scroll", updateSidebarBounds);
      window.removeEventListener("resize", updateSidebarBounds);
      observer.disconnect();
    };
  }, []);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    const trigger = window.matchMedia("(max-width: 600px)").matches
      ? layoutRef.current?.querySelector(".header__menu-btn")
      : toggleRef.current;
    trigger?.focus();
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="layout" ref={layoutRef}>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
        onClose={closeSidebar}
        toggleRef={toggleRef}
      />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
