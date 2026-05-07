import { useMemo, useState } from "react";
import { FolderPlus, Layers3, Pencil, Plus, Save, Search, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import IButton from "@/components/custom/Button";
import IInput from "@/components/custom/Input";
import Paragraph from "@/components/custom/Paragraph";
import ISelect from "@/components/custom/Select";
import Title from "@/components/custom/Title";
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
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/queries/menuQueries";
import { confirmAction } from "@/shared/helpers/confirmAction";
import { extractErrorMessage } from "@/shared/helpers/extractErrorMessage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import MenuStatCards from "@/components/features/menu/MenuStatCards";
import {
  ITEM_COUNT_FILTER_OPTIONS,
  normalizeCategory,
} from "@/config/menu-config";

export default function MenuCategoriesManager() {
  const { data, isLoading, isError, error, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemCountFilter, setItemCountFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = useMemo(
    () => (data ?? []).map((category, index) => normalizeCategory(category, index)),
    [data],
  );

  const filteredCategories = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !term ||
        category.name.toLowerCase().includes(term) ||
        String(category.description ?? "").toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (itemCountFilter === "with-items") {
        return category.itemCount > 0;
      }

      if (itemCountFilter === "empty") {
        return category.itemCount === 0;
      }

      return true;
    });
  }, [categories, debouncedSearchTerm, itemCountFilter]);

  const categoryStats = useMemo(() => {
    const withItems = categories.filter((category) => category.itemCount > 0).length;
    const totalItems = categories.reduce(
      (sum, category) => sum + category.itemCount,
      0,
    );

    return {
      total: categories.length,
      withItems,
      empty: categories.length - withItems,
      totalItems,
    };
  }, [categories]);

  const statCards = useMemo(
    () => [
      {
        label: "Categories",
        value: categoryStats.total,
        icon: Tags,
        iconClassName: "text-taramen-red",
      },
      {
        label: "With Items",
        value: categoryStats.withItems,
        icon: Layers3,
        iconClassName: "text-green-600",
      },
      {
        label: "Empty",
        value: categoryStats.empty,
        icon: X,
        iconClassName: "text-gray-500",
      },
      {
        label: "Assigned Items",
        value: categoryStats.totalItems,
        icon: FolderPlus,
        iconClassName: "text-orange",
      },
    ],
    [categoryStats],
  );

  const hasActiveFilters = searchTerm.trim() !== "" || itemCountFilter !== "all";

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingDescription(category.description ?? "");
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setItemCountFilter("all");
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const name = newName.trim();
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    try {
      await createCategory.mutateAsync({
        name,
        description: newDescription.trim() || null,
      });
      setNewName("");
      setNewDescription("");
      toast.success("Category created.");
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, "Unable to create category."));
    }
  };

  const handleUpdate = async (categoryId) => {
    const name = editingName.trim();
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

      try {
        await updateCategory.mutateAsync({
          id: categoryId,
          payload: {
            name,
            description: editingDescription.trim() || null,
          },
        });
      stopEditing();
      toast.success("Category updated.");
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, "Unable to update category."));
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmed = await confirmAction(
      "Delete category",
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
      toast.success("Category deleted.");
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, "Unable to delete category."));
    }
  };

  return (
      <section className="mt-4 space-y-5 sm:mt-5 lg:mt-6">
        <MenuStatCards items={statCards} />

        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Title size="lg" className="text-gray-900">
                Add Category
              </Title>
              <Paragraph size="sm" className="mt-1 text-gray-500">
                Group related menu items for faster order taking.
              </Paragraph>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-taramen-red/10 text-taramen-red">
              <Plus className="size-5" />
            </span>
          </header>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            <IInput
              useForm={false}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Category name"
              maxLength={80}
              wrapperClassName="w-full gap-0"
              className="h-10 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <IInput
              useForm={false}
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Description (optional)"
              maxLength={180}
              wrapperClassName="w-full gap-0"
              className="h-10 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <IButton
              type="submit"
              variant="taramenRed"
              showLoading={false}
              disabled={createCategory.isPending}
              className="h-10 rounded-lg px-4 md:col-span-2 xl:col-span-1"
            >
              <Plus className="size-4" />
              Add Category
            </IButton>
          </div>
        </form>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <div>
              <Title size="lg" className="text-gray-900">
                Category Catalog
              </Title>
              <Paragraph size="sm" className="mt-1 text-gray-500">
                Search, edit, and remove category records.
              </Paragraph>
            </div>
            <Tags className="size-5 text-taramen-red" />
          </header>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <label className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search category name or description"
                maxLength={120}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-taramen-red focus:bg-white"
              />
            </label>
            <ISelect
              useForm={false}
              showAll={false}
              value={itemCountFilter}
              options={ITEM_COUNT_FILTER_OPTIONS}
              onValueChange={(option) => setItemCountFilter(String(option?.value ?? "all"))}
              placeholder="Item count"
              className="w-full lg:w-56"
              triggerClassName="h-10 rounded-lg border-gray-200 bg-white text-sm"
              contentClassName="bg-white"
            />
            {hasActiveFilters ? (
              <IButton
                type="button"
                variant="outline"
                showLoading={false}
                className="h-10 rounded-lg px-3 text-sm"
                onClick={clearFilters}
              >
                <X className="size-4" />
                Clear filters
              </IButton>
            ) : null}
          </div>
          <Paragraph size="sm" className="mt-2 text-gray-500">
            Showing {filteredCategories.length} of {categories.length} categories
          </Paragraph>
        </div>

        {isLoading ? (
          <Paragraph size="sm" className="mt-4 text-gray-500">
            Loading categories...
          </Paragraph>
        ) : null}

        {isError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <Paragraph size="sm" className="text-red-600">
              {extractErrorMessage(error, "Failed to load categories.")}
            </Paragraph>
            <IButton
              type="button"
              variant="outline"
              showLoading={false}
              className="mt-2"
              onClick={() => refetch()}
            >
              Retry
            </IButton>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fffafa]">
                  <TableHead className="font-bold text-gray-700">Name</TableHead>
                  <TableHead className="font-bold text-gray-700">Description</TableHead>
                  <TableHead className="font-bold text-gray-700">Items</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                      {categories.length === 0
                        ? "No categories found."
                        : "No categories match the current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const isEditing = editingId === category.id;

                    return (
                      <TableRow key={category.id} className="hover:bg-[#fffafa]">
                        <TableCell>
                          {isEditing ? (
                            <input
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value)}
                              className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{category.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <input
                              value={editingDescription}
                              onChange={(event) => setEditingDescription(event.target.value)}
                              className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
                            />
                          ) : (
                            <span className="text-gray-600">{category.description || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell>{category.itemCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <IButton
                                  type="button"
                                  variant="outline"
                                  showLoading={false}
                                  className="h-8 px-2"
                                  onClick={() => handleUpdate(category.id)}
                                  disabled={updateCategory.isPending}
                                >
                                  <Save className="size-4" />
                                </IButton>
                                <IButton
                                  type="button"
                                  variant="outline"
                                  showLoading={false}
                                  className="h-8 px-2"
                                  onClick={stopEditing}
                                >
                                  <X className="size-4" />
                                </IButton>
                              </>
                            ) : (
                              <>
                                <IButton
                                  type="button"
                                  variant="outline"
                                  showLoading={false}
                                  className="h-8 px-2"
                                  onClick={() => startEditing(category)}
                                >
                                  <Pencil className="size-4" />
                                </IButton>
                                <IButton
                                  type="button"
                                  variant="outline"
                                  showLoading={false}
                                  className="h-8 px-2 text-red-500 hover:text-red-600"
                                  onClick={() => handleDelete(category.id)}
                                  disabled={deleteCategory.isPending}
                                >
                                  <Trash2 className="size-4" />
                                </IButton>
                              </>
                            )}
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
