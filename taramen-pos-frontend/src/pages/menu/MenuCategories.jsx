import { useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
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
import PosLayout from "@/layout/PosLayout";
import { confirmAction } from "@/shared/helpers/confirmAction";
import { extractErrorMessage } from "@/shared/helpers/extractErrorMessage";

const normalizeCategory = (category, index) => ({
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

export default function MenuCategories() {
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

  const categories = useMemo(
    () => (data ?? []).map((category, index) => normalizeCategory(category, index)),
    [data],
  );

  const itemCountFilterOptions = useMemo(
    () => [
      { value: "all", label: "All categories" },
      { value: "with-items", label: "With items" },
      { value: "empty", label: "No items" },
    ],
    [],
  );

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

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
  }, [categories, searchTerm, itemCountFilter]);

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
    <PosLayout title="Menu Categories" description="Organize your menu by category.">
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:mt-5 sm:p-5 lg:mt-6 lg:p-6">
        <header className="mb-4">
          <Title size="lg" className="text-gray-900">
            Categories
          </Title>
          <Paragraph size="sm" className="text-gray-500 mt-1">
            Uses `/categories` and `/categories/:id`.
          </Paragraph>
        </header>

        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-xl border border-gray-100 p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]"
        >
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
            Add
          </IButton>
        </form>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <IInput
              useForm={false}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search category name or description"
              maxLength={120}
              wrapperClassName="w-full gap-0 md:flex-1"
              className="h-10 rounded-lg border-gray-200 bg-white px-3 text-sm"
            />
            <ISelect
              useForm={false}
              showAll={false}
              value={itemCountFilter}
              options={itemCountFilterOptions}
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
          <div className="mt-4 rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableRow key={category.id}>
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
    </PosLayout>
  );
}
