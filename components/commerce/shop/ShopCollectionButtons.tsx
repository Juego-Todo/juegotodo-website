"use client";

import { motion } from "framer-motion";
import { ArrowRight, Crown, Shirt, Ticket, Trophy, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { shopCollections, type ShopCollectionId } from "@/lib/commerce/shop-collections";

const collectionIcons: Record<Exclude<ShopCollectionId, "all">, LucideIcon> = {
  "juego-todo-merch": Shirt,
  "event-tickets": Ticket,
  "jt-official-gear": Wrench,
  championship: Crown,
  "digital-courses": Trophy,
};

type ShopCollectionButtonsProps = {
  activeCollection: ShopCollectionId;
  onSelect: (collectionId: ShopCollectionId) => void;
};

export function ShopCollectionButtons({ activeCollection, onSelect }: ShopCollectionButtonsProps) {
  return (
    <MotionSection className="mt-8 sm:mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-zinc-500">Browse Collections</p>
          <h2 className="font-display mt-2 text-3xl font-normal uppercase text-white sm:text-4xl">Shop By Collection</h2>
        </div>
        {activeCollection !== "all" ? (
          <button
            className="hidden shrink-0 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white sm:inline-flex"
            onClick={() => onSelect("all")}
            type="button"
          >
            Clear Filter
          </button>
        ) : null}
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-5">
        {shopCollections.map((collection, index) => {
          const Icon = collectionIcons[collection.id as Exclude<ShopCollectionId, "all">];
          const isActive = activeCollection === collection.id;

          return (
            <motion.button
              className={`group relative min-w-[15rem] overflow-hidden rounded-2xl border p-4 text-left transition sm:min-w-0 ${
                isActive
                  ? "border-[#FF1010]/50 bg-[#FF1010]/10 shadow-[0_0_28px_rgba(255,16,16,0.18)]"
                  : "border-white/10 bg-white/[0.03] hover:border-[#FF1010]/30 hover:bg-white/[0.05]"
              }`}
              key={collection.id}
              onClick={() => onSelect(collection.id)}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div
                className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,16,16,0.14),transparent_55%)] transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={`rounded-xl border p-2.5 transition ${
                    isActive
                      ? "border-[#FF1010]/40 bg-[#FF1010]/15 text-[#FF1010]"
                      : "border-white/10 bg-black/30 text-zinc-300 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden />
                </div>
                <ArrowRight
                  className={`mt-1 shrink-0 transition ${isActive ? "text-[#FF1010]" : "text-zinc-600 group-hover:text-zinc-300"}`}
                  size={16}
                  aria-hidden
                />
              </div>
              <p className="relative mt-4 text-sm font-black uppercase tracking-[0.14em] text-white">{collection.label}</p>
              <p className="relative mt-2 text-sm leading-6 text-zinc-400">{collection.description}</p>
            </motion.button>
          );
        })}
      </div>
    </MotionSection>
  );
}
