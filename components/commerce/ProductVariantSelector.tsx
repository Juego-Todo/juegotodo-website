"use client";

import type { ShopProduct } from "@/data/shop";

type ProductVariantSelectorProps = {
  onChange: (groupId: string, optionId: string) => void;
  product: ShopProduct;
  selections: Record<string, string>;
};

export function ProductVariantSelector({ product, selections, onChange }: ProductVariantSelectorProps) {
  if (!product.variantGroups?.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-5 border-t border-white/[0.06] pt-6">
      {product.variantGroups.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{group.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((option) => {
              const active = selections[group.id] === option.id;

              return (
                <button
                  className={`min-h-10 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    active
                      ? "border-[#FF1010] bg-[#FF1010]/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                  key={option.id}
                  onClick={() => onChange(group.id, option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
