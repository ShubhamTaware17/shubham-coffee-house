import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, Banknote, CreditCard, Smartphone, Tag } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { useStore } from "@/context/store";
import { computeTotals } from "@/lib/domain";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const PAYMENT_METHODS = [
  { id: "Cash on Delivery", icon: Banknote, note: "Pay when your order arrives" },
  { id: "UPI", icon: Smartphone, note: "Demo — no real payment is taken" },
  { id: "Card", icon: CreditCard, note: "Demo — no real payment is taken" },
];

function CheckoutPage() {
  const { cartLines, products, coupons, settings, placeOrder, clearCart } = useStore();
  const navigate = useNavigate();
  const symbol = settings.currency;

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placed, setPlaced] = useState<Order | null>(null);

  const coupon = appliedCoupon ? coupons.find((c) => c.code === appliedCoupon) : undefined;
  const totals = computeTotals({
    items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
    products,
    coupon,
    settings,
  });

  if (placed) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-32 pt-44 text-center sm:px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15"
          >
            <BadgeCheck className="h-12 w-12 text-primary" />
          </motion.div>
          <h1 className="mt-8 font-display text-4xl font-semibold sm:text-5xl">
            Order confirmed!
          </h1>
          <p className="mt-4 text-muted-foreground">
            Thank you, {placed.customerName.split(" ")[0]}! Your order{" "}
            <span className="font-semibold text-primary">{placed.orderNumber}</span> is in the
            queue and will be updated in our kitchen dashboard.
          </p>
          <div className="mt-8 w-full rounded-2xl border border-border/70 bg-card p-6 text-left">
            <div className="flex justify-between border-b border-border pb-3 text-sm">
              <span className="text-muted-foreground">Total paid</span>
              <span className="font-display text-lg font-semibold text-primary">
                {formatMoney(placed.total, symbol)}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {placed.items.map((it) => (
                <li key={it.productId} className="flex justify-between text-muted-foreground">
                  <span>{it.qty} × {it.name}</span>
                  <span>{formatMoney(it.qty * it.price, symbol)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex gap-3">
            <Link to="/shop" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Continue shopping
            </Link>
            <button
              onClick={() => navigate({ to: "/menu" })}
              className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition-colors hover:border-primary/60"
            >
              See the menu
            </button>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex flex-col items-center px-4 pb-32 pt-48 text-center">
          <h1 className="font-display text-4xl font-semibold">Nothing to check out</h1>
          <p className="mt-3 text-muted-foreground">Add a coffee or two first.</p>
          <Link to="/shop" className="mt-8 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow">
            Browse the shop
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const applyCoupon = () => {
    const found = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!found) {
      toast.error("Coupon code not found");
      return;
    }
    setAppliedCoupon(found.code);
    const check = computeTotals({
      items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      products,
      coupon: found,
      settings,
    });
    if (check.couponError) {
      toast.error(check.couponError);
      setAppliedCoupon(null);
    } else {
      toast.success(`Coupon ${found.code} applied — you save ${formatMoney(check.discount, symbol)}`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address";
    if (!/^[+\d][\d\s-]{7,14}$/.test(form.phone.trim())) nextErrors.phone = "Enter a valid phone number";
    if (form.address.trim().length < 10) nextErrors.address = "Enter your full delivery address";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const res = placeOrder({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      address: form.address,
      items: cartLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      couponCode: appliedCoupon,
      paymentMethod,
      note: form.note,
    });
    if (!res.ok || !res.order) {
      toast.error(res.error ?? "Could not place the order");
      return;
    }
    clearCart();
    setPlaced(res.order);
    toast.success(`Order ${res.order.orderNumber} placed successfully`);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Two minutes to your next great coffee.</p>

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            <fieldset className="rounded-2xl border border-border/70 bg-card p-6">
              <legend className="eyebrow px-2">Delivery details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input value={form.name} onChange={set("name")} placeholder="Aarav Mehta" className={inputCls(errors.name)} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inputCls(errors.phone)} />
                </Field>
                <Field label="Delivery note (optional)">
                  <input value={form.note} onChange={set("note")} placeholder="Ring the bell twice" className={inputCls()} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Delivery address" error={errors.address}>
                    <textarea
                      value={form.address}
                      onChange={set("address")}
                      rows={3}
                      placeholder="Flat, street, landmark, city, pincode"
                      className={cn(inputCls(errors.address), "resize-none")}
                    />
                  </Field>
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-border/70 bg-card p-6">
              <legend className="eyebrow px-2">Payment method</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      paymentMethod === pm.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <pm.icon className={cn("h-5 w-5", paymentMethod === pm.id ? "text-primary" : "text-muted-foreground")} />
                    <div className="mt-2 text-sm font-semibold">{pm.id}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{pm.note}</div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                This is a demo checkout — no real payment is processed.
              </p>
            </fieldset>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <ul className="max-h-48 space-y-2 overflow-auto pr-1 text-sm">
              {cartLines.map((l) => (
                <li key={l.product.id} className="flex justify-between gap-2 text-muted-foreground">
                  <span className="truncate">{l.qty} × {l.product.name}</span>
                  <span>{formatMoney(l.product.price * l.qty, symbol)}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 border-t border-border pt-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm uppercase outline-none focus:border-primary/60"
                />
              </div>
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-full border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-primary">
                {appliedCoupon} applied
                <button type="button" onClick={() => setAppliedCoupon(null)} className="ml-2 underline hover:text-destructive">
                  remove
                </button>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">Try WELCOME10 or FIRSTCUP</p>

            <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subtotal, symbol)} />
              {totals.discount > 0 && (
                <Row label="Discount" value={`− ${formatMoney(totals.discount, symbol)}`} accent />
              )}
              <Row label={`GST (${settings.taxRate}%)`} value={formatMoney(totals.tax, symbol)} />
              <Row label="Delivery" value={totals.deliveryFee === 0 ? "Free" : formatMoney(totals.deliveryFee, symbol)} />
              <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
                <dt>Total</dt>
                <dd className="text-primary">{formatMoney(totals.total, symbol)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              Place order · {formatMoney(totals.total, symbol)}
            </button>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "text-primary" : undefined}>{value}</dd>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function inputCls(error?: string) {
  return cn(
    "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60",
    error ? "border-destructive" : "border-border",
  );
}
