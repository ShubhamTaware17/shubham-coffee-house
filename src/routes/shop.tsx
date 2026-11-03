import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

function ShopPage() {
  const { products, categories } = useStore();
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      if (!p.active) return false;
      if (activeCat !== "all" && p.categoryId !== activeCat) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [products, activeCat, query, sort]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="hero-radial grain-overlay px-4 pb-12 pt-36 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">The Shop</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            Take the ritual <span className="gold-text italic">home</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Free delivery on orders over ₹500 · Delivered within 45 minutes in Mumbai.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary/60"
            />
          </div>
          <select
            value={activeCat}
            onChange={(e) => setActiveCat(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/60"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/60"
            >
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            No products found. Try clearing the filters.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
