import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { useStore } from "@/context/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { settings, submitEnquiry } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email";
    if (form.subject.trim().length < 3) errs.subject = "Add a short subject";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more (10+ characters)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    submitEnquiry({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    toast.success("Message sent! We'll reply within one working day.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="hero-radial grain-overlay px-4 pb-12 pt-36 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            Say <span className="gold-text italic">hello</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Party bookings, corporate supply or just coffee talk — we read everything.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            {[
              { icon: MapPin, title: "Visit", body: settings.address },
              { icon: Clock, title: "Hours", body: settings.hours },
              { icon: Phone, title: "Call", body: settings.phone },
              { icon: Mail, title: "Email", body: settings.email },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
                <input value={form.name} onChange={set("name")} placeholder="Your name" className={cls(errors.name)} />
                {errors.name && <span className="mt-1 block text-xs text-destructive">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <input value={form.email} onChange={set("email")} placeholder="you@example.com" className={cls(errors.email)} />
                {errors.email && <span className="mt-1 block text-xs text-destructive">{errors.email}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone (optional)</span>
                <input value={form.phone} onChange={set("phone")} placeholder="+91 …" className={cls()} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</span>
                <input value={form.subject} onChange={set("subject")} placeholder="Booking, feedback, supply…" className={cls(errors.subject)} />
                {errors.subject && <span className="mt-1 block text-xs text-destructive">{errors.subject}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
                <textarea value={form.message} onChange={set("message")} rows={5} placeholder="How can we help?" className={cn(cls(errors.message), "resize-none")} />
                {errors.message && <span className="mt-1 block text-xs text-destructive">{errors.message}</span>}
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              Send message <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function cls(error?: string) {
  return cn(
    "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60",
    error ? "border-destructive" : "border-border",
  );
}
