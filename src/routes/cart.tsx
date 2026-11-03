import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { useStore } from "@/context/store";
import { computeTotals } from "@/lib/domain";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cartLines, setQty, removeFromCart, products, coupons, settings } = useStore();
  const totals = computeTotals({ items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })), products, coupon: undefined, settings });
  const symbol = settings.currency;

  if (cartLines.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex flex-col items-center px-4 pb-32 pt-48 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">Your cart is empty</h1>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Your next favorite brew is a couple of clicks away.
          </p>
          <Link to="/shop" className="mt-8 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">
            Browse the shop
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Your cart</h1>
        <p className="mt-2 text-muted-foreground">{cartLines.length} item{cartLines.length === 1 ? "" : "s"} ready for checkout</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cartLines.map((line, i) => (
              <motion.div
                key={line.product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
              >
                <img
                  src={line.product.image}
                  alt={line.product.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link to="/shop/$id" params={{ id: line.product.id }} className="font-display font-semibold transition-colors hover:text-primary">
                    {line.product.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatMoney(line.product.price, symbol)} each
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease"
                      onClick={() => (line.qty === 1 ? removeFromCart(line.product.id) : setQty(line.product.id, line.qty - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      aria-label="Increase"
                      onClick={() => setQty(line.product.id, line.qty + 1)}
                      disabled={line.qty >= line.product.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold text-primary">
                    {formatMoney(line.product.price * line.qty, symbol)}
                  </div>
                  <button
                    onClick={() => {
                      removeFromCart(line.product.id);
                      toast(`${line.product.name} removed`);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatMoney(totals.subtotal, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{totals.deliveryFee === 0 ? <span className="text-primary">Free</span> : formatMoney(totals.deliveryFee, symbol)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST ({settings.taxRate}%)</dt>
                <dd>{formatMoney(totals.tax, symbol)}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-display text-lg font-semibold">
                  <dt>Total</dt>
                  <dd className="text-primary">{formatMoney(totals.total, symbol)}</dd>
                </div>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-xs text-muted-foreground transition-colors hover:text-primary">
              Continue shopping
            </Link>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Have a coupon? You can apply it at checkout.
            </p>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
