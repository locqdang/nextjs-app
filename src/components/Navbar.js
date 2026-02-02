import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function Navbar({data}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // Close when clicking outside (on mobile)
  useEffect(() => {
    function onClick(e) {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  // Close after navigating
  const closeAndScroll = () => setOpen(false);

    // normalize possible Strapi shapes (v4 vs v5 vs already-normalized)
  const src =
    data?.attributes ??
    data?.data?.attributes ??
    data?.data ??
    data ??
    {};

  const brandLabel = src.brand ?? "";
  const links =
    Array.isArray(src.menuItems) && src.menuItems.length
      ? src.menuItems
      : [
          { id: "def-1", label: "Projects", url: "/#projects" },
          { id: "def-2", label: "Contact",  url: "/#contact"  },
        ];

  return (
    <header className="nav">
      <nav className="nav__inner" aria-label="Primary">
        <Link href="/" className="nav__brand" onClick={closeAndScroll}>
          {brandLabel}
        </Link>

        {/* Desktop links */}
        <div className="nav__links" aria-hidden={open ? "true" : "false"}>
          {links.map((l) => (
            <Link key={l.id ?? `${l.url}|${l.label}`} href={l.url} onClick={closeAndScroll}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          ref={btnRef}
          className="nav__toggle"
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(v => !v)}
        >
          <span className="nav__bar" />
          <span className="nav__bar" />
          <span className="nav__bar" />
        </button>
      </nav>

      {/* Mobile menu */}
      <div id="mobile-menu" ref={menuRef} className={`nav__drawer ${open ? "is-open" : ""}`}>
        <ul className="nav__drawer-list" role="menu">
          {links.map((l) => (
            <li role="none" key={`m|${l.id ?? `${l.url}|${l.label}`}`}>
              <Link role="menuitem" href={l.url} onClick={closeAndScroll}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
