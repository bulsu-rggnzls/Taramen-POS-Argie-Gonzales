import { CakeSlice, CupSoda, Flame, LayoutGrid, Soup } from "lucide-react";

export const CATEGORY_ICON_OPTIONS = [Flame, Soup, CupSoda, CakeSlice];

export const ITEM_ACCENTS = [
  "from-slate-800 via-slate-700 to-slate-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-green-400 via-emerald-500 to-lime-500",
  "from-emerald-700 via-teal-700 to-cyan-700",
  "from-amber-300 via-orange-300 to-yellow-200",
  "from-stone-600 via-stone-700 to-stone-800",
  "from-orange-300 via-amber-400 to-yellow-300",
  "from-amber-400 via-yellow-400 to-orange-300",
];

export const ADD_ONS = [
  { id: "extra-cheese", label: "Extra Cheese", price: 1.5 },
  { id: "bacon", label: "Add Bacon", price: 2 },
  { id: "spicy", label: "Make it Spicy", price: 0.5 },
];

export const REMOVALS = [
  { id: "no-onion", label: "No Onion" },
  { id: "less-ice", label: "Less Ice" },
  { id: "no-salt", label: "No Salt" },
];

export const NONE_DISCOUNT_OPTION = {
  value: "none",
  label: "None",
  type: "none",
  amountValue: 0,
  name: "None",
  category: "",
};

export const ALL_CATEGORY_TAB = {
  id: "all",
  label: "All",
  icon: LayoutGrid,
};
