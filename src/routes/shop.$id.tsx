import { useState } from "react";
import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, MapPin, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/context/store";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/shop/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = useParams({ from: "/shop/$id" });
  const { products, categories, settings, addToCart } = useStore();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.id === id);
  const category = product ? categories.find((c) => c.id === product.categoryId) : undefined;
  const related = product
    ? products.filter((p) => p.active && p.id !== product.id && p.categoryId === product.categoryId).slice(0, 3)
    : [];

  if (!product) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex flex-col items-center px-4 pb-32 pt-48 text-center">
          <h1 className="font-display text-4xl font-semibold">Product not found</h1>
          <p className="mt-3 text-muted-foreground">It may have sold out or been removed.</p>
          <Link to="/shop" className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Back to shop
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-border/70"
          >
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
            {category && (
              <span className="absolute left-4 top-4 rounded-full bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
                {category.name}
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" /> {product.rating}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-primary" /> {product.roast} roast
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{product.name}</h1>
            <div className="mt-4 font-display text-3xl font-semibold text-primary">
              {formatMoney(product.price, settings.currency)}
            </div>
            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Origin</dt>
                <dd className="mt-1 font-medium">{product.origin}</dd>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">SKU</dt>
                <dd className="mt-1 font-medium">{product.sku}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-border">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-l-full transition-colors hover:bg-secondary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-r-full transition-colors hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                disabled={outOfStock}
                onClick={() => {
                  addToCart(product.id, qty);
                  toast.success(`${qty} × ${product.name} added to cart`);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? "Out of stock" : `Add to cart · ${formatMoney(product.price * qty, settings.currency)}`}
              </button>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {outOfStock
                ? "Currently unavailable — check back tomorrow!"
                : `${product.stock} in stock · Free delivery over ${formatMoney(settings.freeDeliveryAbove, settings.currency)}`}
            </p>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-3xl font-semibold">Pairs well with</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
