import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/store";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, categories, settings } = useStore();
  const category = categories.find((c) => c.id === product.categoryId);
  const outOfStock = product.stock <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-elegant"
    >
      <Link to="/shop/$id" params={{ id: product.id }} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            {category.name}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-3 py-1 text-[11px] font-bold text-destructive-foreground">
            Sold out
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to="/shop/$id" params={{ id: product.id }} className="font-display text-lg font-semibold leading-tight transition-colors hover:text-primary">
            {product.name}
          </Link>
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {product.rating}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-xl font-semibold text-primary">
            {formatMoney(product.price, settings.currency)}
          </span>
          <button
            disabled={outOfStock}
            onClick={() => {
              addToCart(product.id);
              toast.success(`${product.name} added to cart`);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
