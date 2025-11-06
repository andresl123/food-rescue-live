import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer"; // <-- add

export default function Layout({ children }) {
  const NAVBAR_HEIGHT = 64;
  const SB_EXPANDED = 260;
  const SB_COLLAPSED = 88;

  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((c) => !c);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (collapsed) return;
      if (sidebarRef.current && sidebarRef.current.contains(e.target)) return;
      if (e.target.closest('[data-ignore-outside="true"]')) return;
      setCollapsed(true);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [collapsed]);

  const cssVars = useMemo(
    () => ({
      "--navbar-h": `${NAVBAR_HEIGHT}px`,
      "--sb-w": `${collapsed ? SB_COLLAPSED : SB_EXPANDED}px`,
      "--content-gap": "16px",
    }),
    [collapsed]
  );

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        overflow: "hidden",
        ...cssVars,
      }}
    >
      <Navbar
        navbarHeight={NAVBAR_HEIGHT}
        collapsed={collapsed}
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar
        navbarHeight={NAVBAR_HEIGHT}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        expandedWidth={SB_EXPANDED}
        collapsedWidth={SB_COLLAPSED}
        sidebarRef={sidebarRef}
      />

      {/* Page content area with sticky footer */}
      <main
        className="flex-grow-1 d-flex flex-column"
        style={{
          backgroundColor: "#fff",
          width: "100%",
          paddingTop: "calc(var(--navbar-h) + var(--content-gap))",
          paddingLeft: "var(--sb-w)",
          minHeight: `calc(100vh - var(--navbar-h))`,
        }}
      >
        <div className="flex-grow-1">
          {children}
        </div>

        <Footer/> {/* <-- footer lives at the end */}
      </main>
    </div>
  );
}
