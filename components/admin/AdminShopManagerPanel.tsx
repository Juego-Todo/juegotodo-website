"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Layers,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminStoreOrdersPanel } from "@/components/admin/AdminStoreOrdersPanel";
import type { ProductVariantGroup, ShopProduct } from "@/data/shop";
import {
  getLiveShopProducts,
  isCustomCatalogProduct,
  removeCatalogProduct,
  slugifyProductName,
  subscribeCatalogChanges,
  updateCatalogStock,
  upsertCatalogProduct,
  type CatalogProductInput,
} from "@/lib/commerce/catalog-store";
import { shopCategoryLabels, type ShopCategory } from "@/lib/commerce/types";

type ShopView = "products" | "orders";
type ProductSortKey = "name" | "category" | "price" | "variants" | "stock";
type SortDirection = "asc" | "desc";

function variantOptionCount(product: ShopProduct) {
  return product.variantGroups?.reduce((sum, group) => sum + group.options.length, 0) ?? 0;
}

function compareProducts(a: ShopProduct, b: ShopProduct, key: ProductSortKey) {
  switch (key) {
    case "category":
      return shopCategoryLabels[a.category].localeCompare(shopCategoryLabels[b.category]);
    case "price":
      return a.priceAmount - b.priceAmount;
    case "variants":
      return variantOptionCount(a) - variantOptionCount(b);
    case "stock":
      return a.stock - b.stock;
    case "name":
    default:
      return a.name.localeCompare(b.name);
  }
}

function SortHeaderButton({
  label,
  sortKey,
  activeKey,
  direction,
  align = "left",
  onSort,
}: {
  label: string;
  sortKey: ProductSortKey;
  activeKey: ProductSortKey;
  direction: SortDirection;
  align?: "left" | "right";
  onSort: (key: ProductSortKey) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      aria-label={`Sort by ${label}${active ? `, ${direction === "asc" ? "ascending" : "descending"}` : ""}`}
      className={`inline-flex items-center gap-1.5 transition hover:text-white ${
        align === "right" ? "justify-self-end" : ""
      } ${active ? "text-white" : "text-zinc-500"}`}
      onClick={() => onSort(sortKey)}
      type="button"
    >
      <span>{label}</span>
      <Icon size={12} aria-hidden />
    </button>
  );
}

const categories = Object.keys(shopCategoryLabels) as ShopCategory[];

type EditorForm = CatalogProductInput & {
  variantGroups: ProductVariantGroup[];
  features: string[];
  specs: { label: string; value: string }[];
};

const emptyForm: EditorForm = {
  name: "",
  category: "apparel",
  priceAmount: 0,
  stock: 0,
  description: "",
  summary: "",
  imageSrc: "",
  badge: "",
  digital: false,
  searchTags: [],
  variantGroups: [],
  features: [],
  specs: [],
};

function productToForm(product: ShopProduct): EditorForm {
  return {
    name: product.name,
    category: product.category,
    priceAmount: product.priceAmount,
    stock: product.stock,
    description: product.description,
    summary: product.summary,
    imageSrc: product.imageSrc ?? "",
    badge: product.badge ?? "",
    digital: Boolean(product.digital),
    searchTags: product.searchTags,
    variantGroups: (product.variantGroups ?? []).map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    })),
    features: [...product.features],
    specs: product.specs.map((spec) => ({ ...spec })),
  };
}

function stockTone(stock: number) {
  if (stock <= 0) return "text-red-300";
  if (stock <= 5) return "text-amber-200";
  return "text-white";
}

function fieldLabelClass() {
  return "text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-500";
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2";

function EditorCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function VariantsEditor({
  groups,
  basePrice,
  onChange,
}: {
  groups: ProductVariantGroup[];
  basePrice: number;
  onChange: (groups: ProductVariantGroup[]) => void;
}) {
  function updateGroup(index: number, next: Partial<ProductVariantGroup>) {
    const copy = groups.map((group) => ({ ...group, options: [...group.options] }));
    copy[index] = { ...copy[index], ...next };
    onChange(copy);
  }

  function addGroup() {
    onChange([
      ...groups,
      {
        id: `option-${Date.now()}`,
        label: "",
        options: [{ id: `value-${Date.now()}`, label: "" }],
      },
    ]);
  }

  function removeGroup(index: number) {
    onChange(groups.filter((_, i) => i !== index));
  }

  function updateOption(
    groupIndex: number,
    optionIndex: number,
    next: Partial<ProductVariantGroup["options"][number]>,
  ) {
    const copy = groups.map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    }));
    copy[groupIndex].options[optionIndex] = {
      ...copy[groupIndex].options[optionIndex],
      ...next,
    };
    onChange(copy);
  }

  function addOption(groupIndex: number) {
    const copy = groups.map((group) => ({ ...group, options: [...group.options] }));
    copy[groupIndex].options.push({ id: `value-${Date.now()}`, label: "" });
    onChange(copy);
  }

  function removeOption(groupIndex: number, optionIndex: number) {
    const copy = groups.map((group) => ({ ...group, options: [...group.options] }));
    copy[groupIndex].options = copy[groupIndex].options.filter((_, i) => i !== optionIndex);
    onChange(copy);
  }

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No variants yet. Add an option like Size or Color to sell this product in multiple versions.
        </p>
      ) : null}

      {groups.map((group, groupIndex) => (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4" key={group.id}>
          <div className="flex items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className={fieldLabelClass()}>Option name</span>
              <input
                className={inputClass}
                onChange={(event) =>
                  updateGroup(groupIndex, {
                    label: event.target.value,
                    id: slugifyProductName(event.target.value) || group.id,
                  })
                }
                placeholder="Size, Color, Design…"
                value={group.label}
              />
            </label>
            <button
              aria-label="Remove option group"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-500/20 text-red-300 transition hover:bg-red-500/10"
              onClick={() => removeGroup(groupIndex)}
              type="button"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-2 text-[0.58rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:grid">
              <span>Value</span>
              <span>Price override (₱)</span>
              <span />
            </div>
            {group.options.map((option, optionIndex) => (
              <div
                className="grid grid-cols-1 gap-2 rounded-xl border border-white/5 bg-black/20 p-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                key={option.id}
              >
                <label className="block min-w-0">
                  <span className="mb-1 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                    Value
                  </span>
                  <input
                    aria-label="Variant value"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2 sm:py-2"
                    onChange={(event) =>
                      updateOption(groupIndex, optionIndex, {
                        label: event.target.value,
                        id: slugifyProductName(event.target.value) || option.id,
                      })
                    }
                    placeholder="Small, Red…"
                    value={option.label}
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                    Price override (₱)
                  </span>
                  <input
                    aria-label="Variant price override"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2 sm:py-2"
                    min={0}
                    onChange={(event) =>
                      updateOption(groupIndex, optionIndex, {
                        priceAmount: Number(event.target.value) || undefined,
                      })
                    }
                    placeholder={`${basePrice || "base"}`}
                    type="number"
                    value={option.priceAmount ?? ""}
                  />
                </label>
                <button
                  aria-label="Remove value"
                  className="grid h-11 w-full place-items-center rounded-lg border border-white/10 text-zinc-500 transition hover:text-white sm:h-9 sm:w-9"
                  onClick={() => removeOption(groupIndex, optionIndex)}
                  type="button"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            <button
              className="inline-flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-300 transition hover:text-white"
              onClick={() => addOption(groupIndex)}
              type="button"
            >
              <Plus size={13} aria-hidden />
              Add value
            </button>
          </div>
        </div>
      ))}

      <button
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:border-red-500/40 hover:text-white"
        onClick={addGroup}
        type="button"
      >
        <Layers size={14} aria-hidden />
        Add option like Size or Color
      </button>
    </div>
  );
}

function ProductEditorPage({
  slug,
  initial,
  onBack,
  onSaved,
}: {
  slug?: string;
  initial: EditorForm;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditorForm>(initial);
  const [tagsText, setTagsText] = useState((initial.searchTags ?? []).join(", "));
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  function set<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpec(index: number, next: Partial<{ label: string; value: string }>) {
    const specs = form.specs.map((spec) => ({ ...spec }));
    specs[index] = { ...specs[index], ...next };
    set("specs", specs);
  }

  function save(stayOnPage: boolean) {
    if (!form.name.trim()) {
      setError("Product title is required.");
      return;
    }
    if (form.priceAmount < 0) {
      setError("Price cannot be negative.");
      return;
    }
    setError("");

    upsertCatalogProduct(
      {
        ...form,
        searchTags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        features: featuresText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        specs: form.specs.filter((spec) => spec.label.trim() && spec.value.trim()),
      },
      slug,
    );
    onSaved();

    if (stayOnPage) {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
    } else {
      onBack();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Back to products"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:text-white"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-red-300">
              {slug ? "Edit Product" : "New Product"}
            </p>
            <h2 className="font-display truncate text-2xl uppercase text-white sm:text-3xl">
              {form.name.trim() || "Untitled Product"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash ? (
            <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-300">
              Saved
            </span>
          ) : null}
          <button
            className="rounded-full border border-white/10 px-5 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white"
            onClick={() => save(true)}
            type="button"
          >
            Save
          </button>
          <button
            className="rounded-full bg-[#FF1010] px-5 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
            onClick={() => save(false)}
            type="button"
          >
            Save &amp; Close
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Main column */}
        <div className="space-y-5">
          <EditorCard title="Product">
            <label className="block">
              <span className={fieldLabelClass()}>Title</span>
              <input
                className={inputClass}
                onChange={(event) => set("name", event.target.value)}
                placeholder="JT Competition Gloves"
                value={form.name}
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass()}>Short description (product card)</span>
              <input
                className={inputClass}
                onChange={(event) => set("description", event.target.value)}
                placeholder="One line shown on the shop grid"
                value={form.description}
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass()}>Full description (product page)</span>
              <textarea
                className={`${inputClass} min-h-28`}
                onChange={(event) => set("summary", event.target.value)}
                placeholder="Tell customers what makes this product official JT gear…"
                value={form.summary}
              />
            </label>
          </EditorCard>

          <EditorCard subtitle="Paste an image path or URL. Uploaded files go in /public/shop/products." title="Media">
            <div className="flex items-start gap-4">
              <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black">
                {form.imageSrc ? (
                  <Image alt="" className="object-cover" fill sizes="96px" src={form.imageSrc} />
                ) : (
                  <Package className="text-zinc-600" size={24} aria-hidden />
                )}
              </span>
              <label className="block min-w-0 flex-1">
                <span className={fieldLabelClass()}>Image URL</span>
                <input
                  className={inputClass}
                  onChange={(event) => set("imageSrc", event.target.value)}
                  placeholder="/shop/products/my-product.png"
                  value={form.imageSrc ?? ""}
                />
              </label>
            </div>
          </EditorCard>

          <EditorCard
            subtitle="Options like Size or Color. A value can override the base price (e.g. XXL costs more)."
            title="Variants"
          >
            <VariantsEditor
              basePrice={form.priceAmount}
              groups={form.variantGroups}
              onChange={(groups) => set("variantGroups", groups)}
            />
          </EditorCard>

          <EditorCard subtitle="One feature per line — shown as bullet points on the product page." title="Features">
            <textarea
              aria-label="Product features"
              className={`${inputClass} min-h-28`}
              onChange={(event) => setFeaturesText(event.target.value)}
              placeholder={"Matched pair for competition\nPremium rattan construction"}
              value={featuresText}
            />
          </EditorCard>

          <EditorCard subtitle="Label / value rows shown in the specifications table." title="Specifications">
            <div className="space-y-2">
              {form.specs.map((spec, index) => (
                <div className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2" key={index}>
                  <input
                    aria-label="Spec label"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2"
                    onChange={(event) => updateSpec(index, { label: event.target.value })}
                    placeholder="Material"
                    value={spec.label}
                  />
                  <input
                    aria-label="Spec value"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-600 focus:ring-2"
                    onChange={(event) => updateSpec(index, { value: event.target.value })}
                    placeholder="Premium rattan"
                    value={spec.value}
                  />
                  <button
                    aria-label="Remove spec"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-500 transition hover:text-white"
                    onClick={() =>
                      set(
                        "specs",
                        form.specs.filter((_, i) => i !== index),
                      )
                    }
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
              <button
                className="inline-flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-red-300 transition hover:text-white"
                onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}
                type="button"
              >
                <Plus size={13} aria-hidden />
                Add specification
              </button>
            </div>
          </EditorCard>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <EditorCard title="Pricing">
            <label className="block">
              <span className={fieldLabelClass()}>Base price (₱)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(event) => set("priceAmount", Number(event.target.value) || 0)}
                type="number"
                value={form.priceAmount}
              />
            </label>
            <p className="text-xs text-zinc-500">
              Variant values can override this price individually in the Variants section.
            </p>
          </EditorCard>

          <EditorCard title="Inventory">
            <label className="block">
              <span className={fieldLabelClass()}>Quantity in stock</span>
              <input
                className={inputClass}
                min={0}
                onChange={(event) => set("stock", Number(event.target.value) || 0)}
                type="number"
                value={form.stock}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                checked={Boolean(form.digital)}
                className="h-4 w-4 accent-[#FF1010]"
                onChange={(event) => set("digital", event.target.checked)}
                type="checkbox"
              />
              Digital product (no shipping)
            </label>
          </EditorCard>

          <EditorCard title="Organization">
            <label className="block">
              <span className={fieldLabelClass()}>Category</span>
              <select
                className={inputClass}
                onChange={(event) => set("category", event.target.value as ShopCategory)}
                value={form.category}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {shopCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={fieldLabelClass()}>Badge</span>
              <input
                className={inputClass}
                onChange={(event) => set("badge", event.target.value)}
                placeholder="Best Seller, New, Limited…"
                value={form.badge ?? ""}
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass()}>Search tags (comma separated)</span>
              <input
                className={inputClass}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="gloves, competition, official"
                value={tagsText}
              />
            </label>
          </EditorCard>
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ product }: { product: ShopProduct }) {
  if (product.imageSrc) {
    return (
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
        <Image alt="" className="object-cover" fill sizes="48px" src={product.imageSrc} />
      </span>
    );
  }

  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/50 text-zinc-500">
      <Package size={18} aria-hidden />
    </span>
  );
}

export function AdminShopManagerPanel({ initialView = "orders" }: { initialView?: ShopView }) {
  const [view, setView] = useState<ShopView>(initialView);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ShopCategory | "all">("all");
  const [sortKey, setSortKey] = useState<ProductSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editor, setEditor] = useState<{ slug?: string; form: EditorForm } | null>(null);

  function refresh() {
    setProducts(getLiveShopProducts());
  }

  useEffect(() => {
    refresh();
    return subscribeCatalogChanges(refresh);
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  function handleSort(key: ProductSortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "name" || key === "category" ? "asc" : "desc");
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const next = products
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => {
        if (!normalized) return true;
        return [product.name, product.description, ...product.searchTags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        const result = compareProducts(a, b, sortKey);
        return sortDirection === "asc" ? result : -result;
      });
    return next;
  }, [products, query, category, sortKey, sortDirection]);

  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
  const outOfStock = products.filter((product) => product.stock <= 0).length;

  function handleDelete(product: ShopProduct) {
    const label = isCustomCatalogProduct(product.slug) ? "delete" : "remove from shop";
    if (!window.confirm(`Are you sure you want to ${label} “${product.name}”?`)) {
      return;
    }
    removeCatalogProduct(product.slug);
    refresh();
  }

  if (editor) {
    return (
      <ProductEditorPage
        initial={editor.form}
        onBack={() => setEditor(null)}
        onSaved={refresh}
        slug={editor.slug}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-start">
        <div className="inline-flex rounded-full border border-white/10 bg-black/40 p-1">
          {(
            [
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "products", label: "Products", icon: Package },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.14em] transition ${
                  view === item.id ? "bg-[#FF1010] text-white" : "text-zinc-400 hover:text-white"
                }`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={14} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "orders" ? (
        <AdminStoreOrdersPanel embedded mode="all" />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Products</p>
              <p className="font-display mt-1 text-3xl text-white">{products.length}</p>
            </div>
            <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-200/70">Low Stock</p>
              <p className="font-display mt-1 text-3xl text-white">{lowStock}</p>
            </div>
            <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/[0.06] px-4 py-4">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-red-300/70">Out of Stock</p>
              <p className="font-display mt-1 text-3xl text-white">{outOfStock}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={14}
                aria-hidden
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-red-500/30 placeholder:text-zinc-500 focus:ring-2"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products…"
                value={query}
              />
            </label>
            <select
              aria-label="Filter category"
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2"
              onChange={(event) => setCategory(event.target.value as ShopCategory | "all")}
              value={category}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {shopCategoryLabels[item]}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort products"
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-red-500/30 focus:ring-2 sm:hidden"
              onChange={(event) => {
                const value = event.target.value as `${ProductSortKey}:${SortDirection}`;
                const [key, direction] = value.split(":") as [ProductSortKey, SortDirection];
                setSortKey(key);
                setSortDirection(direction);
              }}
              value={`${sortKey}:${sortDirection}`}
            >
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
              <option value="category:asc">Category A–Z</option>
              <option value="price:asc">Price: low to high</option>
              <option value="price:desc">Price: high to low</option>
              <option value="variants:desc">Most variants</option>
              <option value="stock:asc">Stock: low to high</option>
              <option value="stock:desc">Stock: high to low</option>
            </select>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF1010] px-5 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#ff2a2a]"
              onClick={() => setEditor({ form: emptyForm })}
              type="button"
            >
              <Plus size={14} aria-hidden />
              Add Product
            </button>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_1fr_0.7fr_0.7fr_0.9fr_auto] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[0.58rem] font-black uppercase tracking-[0.14em] sm:grid">
              <SortHeaderButton
                activeKey={sortKey}
                direction={sortDirection}
                label="Product"
                onSort={handleSort}
                sortKey="name"
              />
              <SortHeaderButton
                activeKey={sortKey}
                direction={sortDirection}
                label="Category"
                onSort={handleSort}
                sortKey="category"
              />
              <SortHeaderButton
                activeKey={sortKey}
                direction={sortDirection}
                label="Price"
                onSort={handleSort}
                sortKey="price"
              />
              <SortHeaderButton
                activeKey={sortKey}
                direction={sortDirection}
                label="Variants"
                onSort={handleSort}
                sortKey="variants"
              />
              <SortHeaderButton
                activeKey={sortKey}
                direction={sortDirection}
                label="Stock"
                onSort={handleSort}
                sortKey="stock"
              />
              <span className="justify-self-end text-zinc-500">Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-zinc-400">No products match this filter.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {filtered.map((product) => {
                  const variantCount = variantOptionCount(product);
                  return (
                    <li
                      className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.6fr)_1fr_0.7fr_0.7fr_0.9fr_auto] sm:items-center"
                      key={product.slug}
                    >
                      <button
                        className="flex min-w-0 items-center gap-3 text-left"
                        onClick={() => setEditor({ slug: product.slug, form: productToForm(product) })}
                        type="button"
                      >
                        <ProductThumb product={product} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white transition hover:text-red-200">
                            {product.name}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">{product.slug}</span>
                        </span>
                      </button>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:contents">
                        <p className="text-sm text-zinc-400">
                          <span className="mb-0.5 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                            Category
                          </span>
                          {shopCategoryLabels[product.category]}
                        </p>
                        <p className="text-sm font-semibold text-white">
                          <span className="mb-0.5 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                            Price
                          </span>
                          {product.price}
                        </p>
                        <p className="text-sm text-zinc-400">
                          <span className="mb-0.5 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                            Variants
                          </span>
                          {variantCount > 0 ? `${variantCount} option${variantCount === 1 ? "" : "s"}` : "—"}
                        </p>
                        <div>
                          <span className="mb-0.5 block text-[0.55rem] font-black uppercase tracking-[0.14em] text-zinc-600 sm:hidden">
                            Stock
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              aria-label={`Decrease stock for ${product.name}`}
                              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white sm:h-8 sm:w-8"
                              onClick={() => {
                                updateCatalogStock(product.slug, product.stock - 1);
                                refresh();
                              }}
                              type="button"
                            >
                              <Minus size={14} />
                            </button>
                            <span className={`min-w-8 text-center text-sm font-bold ${stockTone(product.stock)}`}>
                              {product.stock}
                            </span>
                            <button
                              aria-label={`Increase stock for ${product.name}`}
                              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white sm:h-8 sm:w-8"
                              onClick={() => {
                                updateCatalogStock(product.slug, product.stock + 1);
                                refresh();
                              }}
                              type="button"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <button
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full border border-white/10 px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.12em] text-zinc-300 transition hover:text-white sm:min-h-0 sm:flex-none"
                          onClick={() => setEditor({ slug: product.slug, form: productToForm(product) })}
                          type="button"
                        >
                          Edit
                          <ChevronRight size={12} aria-hidden />
                        </button>
                        <button
                          aria-label={`Remove ${product.name}`}
                          className="grid h-11 w-11 place-items-center rounded-full border border-red-500/20 text-red-300 transition hover:bg-red-500/10 sm:h-9 sm:w-9"
                          onClick={() => handleDelete(product)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
