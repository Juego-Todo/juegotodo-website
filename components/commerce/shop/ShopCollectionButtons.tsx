"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { MotionSection } from "@/components/MotionSection";
import { shopCollections, type ShopCollectionId } from "@/lib/commerce/shop-collections";

type ShopCollectionButtonsProps = {
  activeCollection: ShopCollectionId;
  onSelect: (collectionId: ShopCollectionId) => void;
};

export function ShopCollectionButtons({ activeCollection, onSelect }: ShopCollectionButtonsProps) {
  return (
    <MotionSection className="mt-8 sm:mt-10">
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div>
          <h2 className="font-display text-3xl font-normal uppercase text-white sm:text-4xl">Shop By Collection</h2>
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

      <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {shopCollections.map((collection, index) => {
          const isActive = activeCollection === collection.id;

          return (
            <motion.button
              aria-label={`Explore ${collection.label}`}
              className={`group relative aspect-[9/16] w-[82vw] max-w-[22rem] shrink-0 snap-center cursor-pointer overflow-hidden rounded-[22px] border border-[#2A2A2A] shadow-[0_18px_48px_rgba(0,0,0,0.42)] transition-[border-color,box-shadow,transform] duration-300 ease-out sm:w-full sm:max-w-none ${
                isActive
                  ? "border-[#FF1010]/70 shadow-[0_0_44px_rgba(255,16,16,0.28)] ring-1 ring-[#FF1010]/35"
                  : "hover:border-[#FF1010]/55 hover:shadow-[0_0_44px_rgba(255,16,16,0.22)]"
              }`}
              key={collection.id}
              onClick={() => onSelect(collection.id)}
              title={collection.label}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Image
                alt=""
                aria-hidden
                className="object-cover transition-[transform,filter] duration-300 ease-out group-hover:scale-105 group-hover:brightness-110"
                fill
                sizes="(max-width: 640px) 82vw, 33vw"
                src={collection.imageSrc}
                style={{ objectPosition: collection.imagePosition ?? "center" }}
              />

              <div
                className={`absolute inset-0 transition-colors duration-300 ease-out ${
                  isActive ? "bg-[#FF1010]/12" : "bg-black/15 group-hover:bg-black/5"
                }`}
                aria-hidden
              />

              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.55)_72%,rgba(0,0,0,0.92)_100%)] transition-opacity duration-300 ease-out group-hover:opacity-100"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.18)_100%)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                aria-hidden
              />

              <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
                <p className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.28em] text-white/75 backdrop-blur-sm">
                  Official Collection
                </p>

                <div className="relative pt-16">
                  <div
                    className={`transition-transform duration-300 ease-out ${
                      isActive ? "-translate-y-2" : "group-hover:-translate-y-2"
                    }`}
                  >
                    <h3 className="font-display text-[clamp(2rem,5vw,2.75rem)] font-normal uppercase leading-[0.92] tracking-[0.04em] text-white">
                      {collection.displayTitle}
                    </h3>
                    <p className="mt-3 max-w-[18rem] text-[0.82rem] leading-relaxed text-white/72 sm:text-[0.86rem]">
                      {collection.description}
                    </p>
                    <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                      {collection.metadata}
                    </p>
                  </div>

                  <p
                    className={`mt-4 flex items-center gap-1.5 text-[0.78rem] font-black uppercase tracking-[0.14em] text-[#FF1010] transition-all duration-300 ease-out ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    }`}
                  >
                    Explore Collection
                    <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.5} />
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </MotionSection>
  );
}
