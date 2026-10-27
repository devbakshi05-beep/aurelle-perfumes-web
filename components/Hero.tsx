"use client";
import Link from "next/link";
import { motion } from "motion/react";

function Bottle({ w, h, label, delay }: { w: number; h: number; label: string; delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      className="relative rounded-xl border border-gold bg-[#2A231F]"
      style={{ width: w, height: h }}
    >
      <div className="absolute -top-8 left-1/2 h-8 w-1/3 -translate-x-1/2 rounded-t bg-gold" />
      <div className="absolute inset-x-3 top-1/3 flex h-1/3 items-center justify-center border border-gold px-1 text-center font-display text-base text-gold">
        {label}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-12 px-5 py-14">
      <div className="max-w-xl flex-1 basis-96">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs tracking-[0.3em] text-accent"
        >
          THE AUTUMN COLLECTION
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-4 font-display text-6xl leading-none sm:text-7xl"
        >
          Scent that
          <br />
          stays with you
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-lg text-mut"
        >
          Discover long-lasting fragrances from curated houses. Filter by notes, brand and mood to find your signature.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link href="/products" className="flex min-h-12 items-center rounded-full bg-gold px-8 font-medium text-on-gold">
            Shop Now
          </Link>
          <Link
            href="/products?sort=newest"
            className="flex min-h-12 items-center rounded-full border border-line px-8 hover:border-gold"
          >
            New Arrivals
          </Link>
        </motion.div>
      </div>

      <div className="flex flex-1 basis-80 items-end justify-center gap-6 pt-12">
        <Bottle w={90} h={190} label="Rose Petal" delay={0.4} />
        <Bottle w={120} h={260} label="Midnight Oud" delay={0} />
        <Bottle w={90} h={170} label="Citrus Aura" delay={0.8} />
      </div>
    </section>
  );
}
