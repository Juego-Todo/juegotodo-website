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
    <MotionSection className="mt-6 sm:mt-8">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="font-display text-2xl font-normal uppercase text-white sm:text-3xl">Shop By Collection</h2>
        </div>
        {activeCollection !== "all" ? (
          <button
            className="hidden shrink-0 text-[0.56rem] font-black uppercase tracking-[0.14em] text-zinc-500 transition hover:text-white sm:inline-flex"
            onClick={() => onSelect("all")}
            type="button"
          >
            Clear Filter
          </button>
        ) : null}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {shopCollections.map((collection, index) => {
          const isActive = activeCollection === collection.id;

          return (
            <motion.button
              aria-label={`Explore ${collection.label}`}
              className={`group relative aspect-[4/5] w-[46vw] max-w-[11rem] shrink-0 snap-center cursor-pointer overflow-hidden rounded-2xl border border-[#2A2A2A] shadow-[0_12px_32px_rgba(0,0,0,0.38)] transition-[border-color,box-shadow,transform] duration-300 ease-out sm:w-full sm:max-w-none sm:rounded-[18px] ${
                isActive
                  ? "border-[#FF1010]/70 shadow-[0_0_32px_rgba(255,16,16,0.24)] ring-1 ring-[#FF1010]/35"
                  : "hover:border-[#FF1010]/55 hover:shadow-[0_0_32px_rgba(255,16,16,0.18)]"
              }`}
              key={collection.id}
              onClick={() => onSelect(collection.id)}
              title={collection.label}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Image
                alt=""
                aria-hidden
                className="object-cover transition-[transform,filter] duration-300 ease-out group-hover:scale-105 group-hover:brightness-110"
                fill
                sizes="(max-width: 640px) 46vw, 33vw"
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

              <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
                <p className="w-fit rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[0.48rem] font-black uppercase tracking-[0.22em] text-white/75 backdrop-blur-sm sm:text-[0.5rem]">
                  Official Collection
                </p>

                <div className="relative pt-6 sm:pt-8">
                  <div
                    className={`transition-transform duration-300 ease-out ${
                      isActive ? "-translate-y-1" : "group-hover:-translate-y-1"
                    }`}
                  >
                    <h3 className="font-display text-[clamp(1.15rem,4.2vw,1.85rem)] font-normal uppercase leading-[0.92] tracking-[0.03em] text-white">
                      {collection.displayTitle}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 max-w-[14rem] text-[0.62rem] leading-snug text-white/72 sm:mt-2 sm:text-[0.68rem]">
                      {collection.description}
                    </p>
                    <p className="mt-1.5 hidden text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-white/45 sm:block sm:text-[0.58rem]">
                      {collection.metadata}
                    </p>
                  </div>

                  <p
                    className={`mt-2 flex items-center gap-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-[#FF1010] transition-all duration-300 ease-out sm:mt-3 sm:text-[0.62rem] ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    }`}
                  >
                    Explore Collection
                    <ArrowRight aria-hidden className="size-3" strokeWidth={2.5} />
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
