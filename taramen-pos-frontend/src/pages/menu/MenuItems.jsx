import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import IButton from "@/components/custom/Button";
import IInput from "@/components/custom/Input";
import Paragraph from "@/components/custom/Paragraph";
import ISelect from "@/components/custom/Select";
import Title from "@/components/custom/Title";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCategories,
  useCreateMenuItem,
  useMenuItems,
  useToggleMenuItemAvailability,
} from "@/queries/menuQueries";
import PosLayout from "@/layout/PosLayout";
import { extractErrorMessage } from "@/shared/helpers/extractErrorMessage";
import { getRequestFileUrl } from "@/shared/helpers/getRequestFileUrl";
import { useDebounce } from "@/shared/hooks/useDebounce";

const MENU_TYPE_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "bundle", label: "Bundle" },
];

const MENU_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...MENU_TYPE_OPTIONS,
];

const AVAILABILITY_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

const normalizeCategory = (category, index) => ({
  id: category?.id ?? category?.category_id ?? category?.uuid ?? String(index + 1),
  name:
    category?.name ??
    category?.category_name ??
    category?.title ??
    `Category ${index + 1}`,
});

const normalizeMenuItem = (item, index) => ({
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

export default function MenuItems() {
  const categoriesQuery = useCategories();
  const menuItemsQuery = useMenuItems();
  const createMenuItem = useCreateMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [menuType, setMenuType] = useState("solo");
  const [description, setDescription] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const pictureInputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    return () => {
      if (picturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((category, index) =>
        normalizeCategory(category, index),
      ),
    [categoriesQuery.data],
  );

  const categoryMap = useMemo(
    () =>
      categories.reduce((acc, category) => {
        acc[String(category.id)] = category.name;
        return acc;
      }, {}),
    [categories],
  );

  const categorySelectOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  const categoryFilterOptions = useMemo(
    () => [{ value: "all", label: "All categories" }, ...categorySelectOptions],
    [categorySelectOptions],
  );

  const menuItems = useMemo(
    () =>
      (menuItemsQuery.data ?? []).map((item, index) =>
        normalizeMenuItem(item, index),
      ),
    [menuItemsQuery.data],
  );

  const filteredMenuItems = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {
      const resolvedCategoryName =
        item.categoryName !== "-"
          ? item.categoryName
          : categoryMap[String(item.categoryId)] || "-";

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        resolvedCategoryName.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (categoryFilter !== "all" && String(item.categoryId) !== String(categoryFilter)) {
        return false;
      }

      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      if (availabilityFilter === "available" && !item.isAvailable) {
        return false;
      }

      if (availabilityFilter === "unavailable" && item.isAvailable) {
        return false;
      }

      return true;
    });
  }, [menuItems, debouncedSearchTerm, categoryFilter, typeFilter, availabilityFilter, categoryMap]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    availabilityFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setAvailabilityFilter("all");
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (picturePreview.startsWith("blob:")) {
      URL.revokeObjectURL(picturePreview);
    }

    if (!file) {
      setPictureFile(null);
      setPicturePreview("");
      return;
    }

    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName) {
      toast.error("Item name is required.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error("Enter a valid price.");
      return;
    }

    if (!categoryId) {
      toast.error("Select a category.");
      return;
    }

    const normalizedCategoryId = Number.isNaN(Number(categoryId))
      ? categoryId
      : Number(categoryId);

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("price", String(numericPrice));
    formData.append("category_id", String(normalizedCategoryId));
    formData.append("available", "true");
    formData.append("status", "true");
    if (pictureFile) {
      formData.append("image", pictureFile);
    }

    try {
      await createMenuItem.mutateAsync(formData);
      setName("");
      setPrice("");
      setCategoryId("");
      setMenuType("solo");
      setDescription("");
      if (picturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(picturePreview);
      }
      setPictureFile(null);
      setPicturePreview("");
      if (pictureInputRef.current) {
        pictureInputRef.current.value = "";
      }
      toast.success("Menu item created.");
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, "Unable to create menu item."));
    }
  };

  const handleToggleAvailability = async (menuItem) => {
    try {
      await toggleAvailability.mutateAsync(menuItem.id);
      toast.success(
        menuItem.isAvailable
          ? "Item marked unavailable."
          : "Item marked available.",
      );
    } catch (requestError) {
      toast.error(
        extractErrorMessage(requestError, "Unable to toggle availability."),
      );
    }
  };

  const hasError = categoriesQuery.isError || menuItemsQuery.isError;
  const errorMessage =
    extractErrorMessage(categoriesQuery.error, "") ||
    extractErrorMessage(menuItemsQuery.error, "Failed to load menu data.");

  return (
    <PosLayout title="Menu Items" description="Manage items, pricing, and availability.">
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:mt-5 sm:p-5 lg:mt-6 lg:p-6">
        <header className="mb-4">
          <Title size="lg" className="text-gray-900">
            Menu Items
          </Title>
          <Paragraph size="sm" className="mt-1 text-gray-500">
            Add item picture (optional), type (solo or bundle), and category assignment.
          </Paragraph>
        </header>

        <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-gray-100 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <IInput
              useForm={false}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Item name"
              maxLength={120}
              wrapperClassName="w-full gap-0"
              className="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Price"
              className="h-10 w-full min-w-0 rounded-lg border border-gray-200 px-3 text-sm"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={categoryId}
              options={categorySelectOptions}
              onValueChange={(option) => setCategoryId(String(option?.value ?? ""))}
              placeholder="Select category"
              className="w-full"
              triggerClassName="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white px-3 text-sm font-normal text-gray-700"
              contentClassName="max-h-72 bg-white"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={menuType}
              options={MENU_TYPE_OPTIONS}
              onValueChange={(option) => setMenuType(String(option?.value ?? "solo"))}
              placeholder="Type"
              className="w-full"
              triggerClassName="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white px-3 text-sm font-normal text-gray-700"
              contentClassName="bg-white"
            />
            <IInput
              useForm={false}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              maxLength={220}
              wrapperClassName="w-full gap-0"
              className="h-10 w-full min-w-0 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <IButton
              type="submit"
              variant="taramenRed"
              showLoading={false}
              disabled={createMenuItem.isPending}
              className="h-10 w-full rounded-lg px-4 md:col-span-2 xl:col-span-3"
            >
              <Plus className="size-4" />
              Add
            </IButton>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_5.625rem] md:items-center">
            <input
              ref={pictureInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-sm"
            />
            {picturePreview ? (
              <img
                src={picturePreview}
                alt="Menu item preview"
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
                No image
              </div>
            )}
          </div>
        </form>

        {categoriesQuery.isLoading || menuItemsQuery.isLoading ? (
          <Paragraph size="sm" className="mt-4 text-gray-500">
            Loading menu items...
          </Paragraph>
        ) : null}

        {hasError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <Paragraph size="sm" className="text-red-600">
              {errorMessage}
            </Paragraph>
            <div className="mt-2 flex gap-2">
              <IButton
                type="button"
                variant="outline"
                showLoading={false}
                onClick={() => categoriesQuery.refetch()}
              >
                Retry categories
              </IButton>
              <IButton
                type="button"
                variant="outline"
                showLoading={false}
                onClick={() => menuItemsQuery.refetch()}
              >
                Retry items
              </IButton>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
            <IInput
              useForm={false}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, description, or category"
              maxLength={120}
              wrapperClassName="w-full gap-0"
              className="h-10 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={categoryFilter}
              options={categoryFilterOptions}
              onValueChange={(option) => setCategoryFilter(String(option?.value ?? "all"))}
              placeholder="Category"
              className="w-full"
              triggerClassName="h-10 rounded-lg border-gray-200 bg-white text-sm"
              contentClassName="bg-white"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={typeFilter}
              options={MENU_TYPE_FILTER_OPTIONS}
              onValueChange={(option) => setTypeFilter(String(option?.value ?? "all"))}
              placeholder="Type"
              className="w-full"
              triggerClassName="h-10 rounded-lg border-gray-200 bg-white text-sm"
              contentClassName="bg-white"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={availabilityFilter}
              options={AVAILABILITY_FILTER_OPTIONS}
              onValueChange={(option) => setAvailabilityFilter(String(option?.value ?? "all"))}
              placeholder="Status"
              className="w-full"
              triggerClassName="h-10 rounded-lg border-gray-200 bg-white text-sm"
              contentClassName="bg-white"
            />
            {hasActiveFilters ? (
              <IButton
                type="button"
                variant="outline"
                showLoading={false}
                className="h-10 rounded-lg px-3 text-sm md:col-span-2 xl:col-span-1"
                onClick={clearFilters}
              >
                <X className="size-4" />
                Clear filters
              </IButton>
            ) : null}
          </div>
          <Paragraph size="sm" className="mt-2 text-gray-500">
            Showing {filteredMenuItems.length} of {menuItems.length} menu items
          </Paragraph>
        </div>

        {!categoriesQuery.isLoading && !menuItemsQuery.isLoading && !hasError ? (
          <div className="mt-4 rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Picture</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-gray-500">
                      {menuItems.length === 0
                        ? "No menu items found."
                        : "No menu items match the current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMenuItems.map((item) => {
                    const resolvedCategoryName =
                      item.categoryName !== "-"
                        ? item.categoryName
                        : categoryMap[String(item.categoryId)] || "-";

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.imagePath ? (
                            <img
                              src={getRequestFileUrl(item.imagePath, item.imageIsPrivate)}
                              alt={item.name}
                              className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[0.625rem] text-gray-400">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500">
                              {item.description || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">
                            {item.type === "bundle" ? "Bundle" : "Solo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{resolvedCategoryName}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <IButton
                              type="button"
                              variant="outline"
                              showLoading={false}
                              className="h-8 px-3"
                              onClick={() => handleToggleAvailability(item)}
                              disabled={toggleAvailability.isPending}
                            >
                              <RefreshCw className="size-4" />
                              Toggle
                            </IButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </section>
    </PosLayout>
  );
}
