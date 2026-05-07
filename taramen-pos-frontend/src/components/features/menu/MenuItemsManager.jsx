import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleDollarSign,
  ImagePlus,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Utensils,
  X,
} from "lucide-react";
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
import { extractErrorMessage } from "@/shared/helpers/extractErrorMessage";
import { getRequestFileUrl } from "@/shared/helpers/getRequestFileUrl";
import { useDebounce } from "@/shared/hooks/useDebounce";
import MenuStatCards from "@/components/features/menu/MenuStatCards";
import {
  AVAILABILITY_FILTER_OPTIONS,
  MENU_TYPE_FILTER_OPTIONS,
  MENU_TYPE_OPTIONS,
  normalizeCategory,
  normalizeMenuItem,
} from "@/config/menu-config";

export default function MenuItemsManager() {
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

  const menuStats = useMemo(() => {
    const availableCount = menuItems.filter((item) => item.isAvailable).length;
    const unavailableCount = menuItems.length - availableCount;
    const averagePrice =
      menuItems.length > 0
        ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length
        : 0;

    return {
      total: menuItems.length,
      availableCount,
      unavailableCount,
      averagePrice,
    };
  }, [menuItems]);

  const statCards = useMemo(
    () => [
      {
        label: "Total Items",
        value: menuStats.total,
        icon: Utensils,
        iconClassName: "text-taramen-red",
      },
      {
        label: "Available",
        value: menuStats.availableCount,
        icon: PackageCheck,
        iconClassName: "text-green-600",
      },
      {
        label: "Unavailable",
        value: menuStats.unavailableCount,
        icon: X,
        iconClassName: "text-gray-500",
      },
      {
        label: "Avg. Price",
        value: `$${menuStats.averagePrice.toFixed(2)}`,
        icon: CircleDollarSign,
        iconClassName: "text-orange",
      },
    ],
    [menuStats],
  );

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
      <section className="mt-4 space-y-5 sm:mt-5 lg:mt-6">
        <MenuStatCards items={statCards} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem]">
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Title size="lg" className="text-gray-900">
                  Add Menu Item
                </Title>
                <Paragraph size="sm" className="mt-1 text-gray-500">
                  Create menu records for the POS item grid.
                </Paragraph>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-taramen-red/10 text-taramen-red">
                <Plus className="size-5" />
              </span>
            </header>
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
                wrapperClassName="w-full gap-0 md:col-span-2"
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
                Add Item
              </IButton>
            </div>
          </form>

          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <header className="mb-4 flex items-center gap-2">
              <ImagePlus className="size-5 text-taramen-red" />
              <Title size="sm" className="text-gray-900">
                Item Picture
              </Title>
            </header>
            <div className="space-y-3">
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Menu item preview"
                  className="h-32 w-full rounded-xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                  No image selected
                </div>
              )}
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-sm"
              />
            </div>
          </div>
        </div>

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

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <div>
              <Title size="lg" className="text-gray-900">
                Menu Catalog
              </Title>
              <Paragraph size="sm" className="mt-1 text-gray-500">
                Filter, review, and toggle menu availability.
              </Paragraph>
            </div>
            <Tags className="size-5 text-taramen-red" />
          </header>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, description, or category"
                maxLength={120}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-taramen-red focus:bg-white"
              />
            </label>
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
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fffafa]">
                  <TableHead className="font-bold text-gray-700">Picture</TableHead>
                  <TableHead className="font-bold text-gray-700">Name</TableHead>
                  <TableHead className="font-bold text-gray-700">Type</TableHead>
                  <TableHead className="font-bold text-gray-700">Category</TableHead>
                  <TableHead className="font-bold text-gray-700">Price</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
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
                      <TableRow key={item.id} className="hover:bg-[#fffafa]">
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
  );
}
