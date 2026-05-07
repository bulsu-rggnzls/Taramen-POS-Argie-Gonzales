export const MENU_TYPE_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "bundle", label: "Bundle" },
];

export const MENU_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...MENU_TYPE_OPTIONS,
];

export const AVAILABILITY_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

export const ITEM_COUNT_FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "with-items", label: "With items" },
  { value: "empty", label: "No items" },
];

export const normalizeCategory = (category, index) => ({
  id: category?.id ?? category?.category_id ?? category?.uuid ?? String(index + 1),
  name:
    category?.name ??
    category?.category_name ??
    category?.title ??
    `Category ${index + 1}`,
  description: category?.description ?? category?.details ?? "",
  itemCount: Number(
    category?.menu_items_count ??
      category?.items_count ??
      category?.item_count ??
      category?.items?.length ??
      0,
  ),
});

export const normalizeMenuItem = (item, index) => ({
  id: item?.id ?? item?.menu_item_id ?? item?.uuid ?? String(index + 1),
  name: item?.name ?? item?.item_name ?? item?.title ?? `Item ${index + 1}`,
  categoryId:
    item?.menu_id ??
    item?.category_id ??
    item?.menu?.id ??
    item?.category?.id ??
    "",
  categoryName:
    item?.menu_name ??
    item?.menu?.name ??
    item?.menu?.title ??
    item?.category_name ??
    item?.category?.name ??
    item?.category?.title ??
    "-",
  price: Number(item?.price ?? item?.selling_price ?? item?.amount ?? 0),
  description: item?.description ?? item?.details ?? "",
  type: String(
    item?.type ?? item?.item_type ?? item?.menu_type ?? item?.variant ?? "solo",
  ).toLowerCase(),
  imagePath:
    item?.image_url ??
    item?.image ??
    item?.picture_url ??
    item?.picture ??
    item?.photo_url ??
    item?.photo ??
    "",
  imageIsPrivate: Boolean(
    item?.image_is_private ??
      item?.picture_is_private ??
      item?.is_private ??
      false,
  ),
  isAvailable: Boolean(
    item?.is_available ?? item?.available ?? item?.is_active ?? true,
  ),
});
