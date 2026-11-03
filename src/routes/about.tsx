import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Coffee, HeartHandshake, Leaf, Recycle, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { employees, settings } = useStore();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="hero-radial grain-overlay px-4 pb-16 pt-36 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Our Story</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
            A small shop with a <span className="gold-text italic">big obsession.</span>
          </h1>
          <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
            {settings.shopName} started in 2025 as a two-table espresso counter
            with one stubborn belief: great coffee is a craft, not a commodity.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-2">
        <motion.img
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          src="/img/french-press.jpg"
          alt="Brewing ritual at the shop"
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-[4/3] w-full rounded-3xl border border-border/70 object-cover shadow-elegant"
        />
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-semibold">From Chikmagalur, with intent</h2>
          <p className="leading-relaxed text-muted-foreground">
            We buy directly from smallholder estates in Chikmagalur, Coorg and
            Araku Valley — paying above fair-trade rates and cupping every lot
            before it ships. Each Tuesday we roast in-house in small batches,
            never serving a shot older than 21 days.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            In the shop, our baristas pull every espresso by hand, texture milk
            to order and time every pour-over with a scale and a timer. It's
            slower. It tastes like it.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: "12", label: "Signature brews" },
              { value: "5", label: "Estate partners" },
              { value: "21d", label: "Max bean age" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-4 text-center">
                <div className="font-display text-2xl font-semibold text-primary">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">What we stand for</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Coffee, title: "Craft first", body: "Hand-pulled shots, timed brews, no shortcuts." },
              { icon: Leaf, title: "Direct trade", body: "Above fair-trade rates, paid to growers directly." },
              { icon: Recycle, title: "Low waste", body: "Compostable cups, spent grounds to city gardens." },
              { icon: HeartHandshake, title: "Warm rooms", body: "A space where nobody is rushed out of a seat." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border/70 bg-card p-6"
              >
                <v.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow"><Users className="h-3.5 w-3.5" /> The Team</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">The people behind the bar</h2>
          </div>
          <Link to="/contact" className="text-sm font-semibold text-primary hover:underline">
            Work with us →
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {employees.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-border/70 bg-card p-6 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 font-display text-xl font-bold text-primary">
                {emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-4 font-display font-semibold">{emp.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-primary">{emp.role}</p>
              <p className="mt-2 text-xs text-muted-foreground">{emp.shift} shift · since {new Date(emp.joinedAt).getFullYear()}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
          >
            Taste the difference <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
