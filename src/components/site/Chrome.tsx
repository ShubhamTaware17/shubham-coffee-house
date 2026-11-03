import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Menu", to: "/menu" },
  { label: "Shop", to: "/shop" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteHeader() {
  const { cartCount, settings } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-card border-b py-3" : "border-b border-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform duration-300 group-hover:rotate-12">
            <Coffee className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide">
            SHUBHAM <span className="gold-text">COFFEE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 transition-colors hover:border-primary/60 hover:bg-card"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            to="/shop"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110 md:inline-flex"
          >
            Order Now
          </Link>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-card overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-primary"
                  activeProps={{ className: "active" }}
                >
                  {item.label}
                </Link>
              ))}
              <span className="mt-1 px-3 text-xs text-muted-foreground">{settings.hours}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function SiteFooter() {
  const { settings } = useStore();
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Coffee className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">{settings.shopName}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings.tagline}. Single-origin beans, slow brewing rituals and a warm
            room that feels like home — since 2025.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">{settings.instagram}</p>
        </div>

        <div>
          <h4 className="eyebrow">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/menu" className="transition-colors hover:text-primary">Menu</Link></li>
            <li><Link to="/shop" className="transition-colors hover:text-primary">Shop</Link></li>
            <li><Link to="/about" className="transition-colors hover:text-primary">Our Story</Link></li>
            <li><Link to="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
            <li><Link to="/admin" className="transition-colors hover:text-primary">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Visit Us</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>{settings.address}</li>
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li>{settings.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © 2026 {settings.shopName} · Crafted with love and a lot of caffeine
      </div>
    </footer>
  );
}
