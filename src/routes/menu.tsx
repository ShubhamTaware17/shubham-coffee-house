import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
});

function MenuPage() {
  const { products, categories } = useStore();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (activeCat !== "all" && p.categoryId !== activeCat) return false;
      if (query && !`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [products, activeCat, query]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="hero-radial grain-overlay px-4 pb-12 pt-36 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">The Menu</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            Crafted to <span className="gold-text italic">perfection</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Every drink starts with beans roasted no more than 21 days ago.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="sticky top-20 z-30 -mx-4 bg-background/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <CategoryChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
                All
              </CategoryChip>
              {categories.map((c) => (
                <CategoryChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
                  {c.name}
                </CategoryChip>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drinks & bakes…"
                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary/60"
              />
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            Nothing matches "{query}". Try another craving?
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}
