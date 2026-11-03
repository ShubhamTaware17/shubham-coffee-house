import { lazy, Suspense, useEffect, useRef } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowRight, Clock, CupSoda, Flame, Leaf, Sparkles, Star } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { ProductCard } from "@/components/site/ProductCard";
import { useStore } from "@/context/store";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { products, categories, settings } = useStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const featured = products.filter((p) => p.active && p.featured).slice(0, 6);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".reveal-stagger > *").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: (i % 4) * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="hero-radial grain-overlay relative flex min-h-screen items-center overflow-hidden pt-28">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="eyebrow"
            >
              <Sparkles className="h-3.5 w-3.5" /> Est. 2025 · Mumbai
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
            >
              Where every cup
              <br />
              <span className="gold-text italic">tells a story.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Single-origin beans from India's finest estates, roasted in-house,
              brewed with obsession. Welcome to {settings.shopName}.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
              >
                Order Your Ritual
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-primary/60 hover:text-primary"
              >
                Explore the Menu
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="mt-12 flex flex-wrap gap-8 text-sm"
            >
              {[
                { icon: CupSoda, value: "12", label: "Signature brews" },
                { icon: Leaf, value: "5", label: "Single origins" },
                { icon: Star, value: "4.8", label: "Avg. rating" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-display text-lg font-semibold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
            <ClientOnly fallback={<div className="h-full w-full rounded-full bg-gradient-to-b from-primary/10 to-transparent" />}>
              <Suspense fallback={null}>
                <HeroScene />
              </Suspense>
            </ClientOnly>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <Clock className="h-4 w-4 rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow"><Flame className="h-3.5 w-3.5" /> House Favorites</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Crowd pleasers</h2>
          </div>
          <Link to="/menu" className="text-sm font-semibold text-primary transition-colors hover:underline">
            View full menu →
          </Link>
        </div>
        <div className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* STORY TEASER */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <div className="reveal relative">
            <img
              src="/img/beans-bag.jpg"
              alt="Our signature roast"
              loading="lazy"
              width={1024}
              height={1024}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-elegant"
            />
            <div className="glass-card absolute -bottom-6 -right-4 rounded-2xl px-6 py-4 sm:right-8">
              <div className="font-display text-3xl font-semibold text-primary">18h</div>
              <div className="text-xs text-muted-foreground">cold brew steep</div>
            </div>
          </div>
          <div className="reveal">
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Roasted in-house,<br />poured with intent.
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              What began as a two-table espresso counter is now Mumbai's cozy
              escape for slow mornings and late-night conversations. We buy
              directly from Chikmagalur and Araku growers, roast every Tuesday,
              and never serve a shot older than 21 days.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="reveal text-center">
          <p className="eyebrow justify-center">Browse</p>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Pick your mood</h2>
        </div>
        <div className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((cat) => {
            const sample = products.find((p) => p.categoryId === cat.id && p.active);
            return (
              <Link
                key={cat.id}
                to="/menu"
                className="group relative overflow-hidden rounded-2xl border border-border/70"
              >
                <img
                  src={sample?.image ?? "/img/espresso.jpg"}
                  alt={cat.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <h3 className="font-display text-xl font-semibold">{cat.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="reveal text-center">
            <p className="eyebrow justify-center">Kind Words</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Loved by regulars</h2>
          </div>
          <div className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "The 18-hour cold brew ruined every other coffee for me. Worth it.",
                name: "Aarav Mehta",
                role: "Regular since 2024",
              },
              {
                quote: "Warm room, honest coffee, and the croissants are genuinely Paris-grade.",
                name: "Priya Sharma",
                role: "Weekend loyalist",
              },
              {
                quote: "Ordered 40 cups for the office — everyone asked where they were from.",
                name: "Rohan Deshpande",
                role: "Bulk order customer",
              },
            ].map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border/70 bg-card p-7">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="mt-4 font-display text-lg leading-snug">"{t.quote}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground"> · {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="reveal grain-overlay relative overflow-hidden rounded-4xl border border-border/70 bg-gradient-to-br from-card to-background p-12 text-center sm:p-16">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">
            Your table is <span className="gold-text italic">waiting.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Order ahead for delivery, or walk in — {settings.hours}.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
          >
            Start Your Order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
