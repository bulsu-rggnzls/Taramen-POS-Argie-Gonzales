import React, { useState, useMemo, useEffect, useCallback, useTransition, useRef } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useDatatableStore } from "@/stores/useDatatableStore";
import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableFooter,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
   MoreHorizontalIcon,
   SearchIcon,
   XIcon,
   Loader2,
   Calendar,
   ChevronDown,
   ChevronRight,
   ArrowDownUp,
   ArrowUp,
   ArrowDown,
} from "lucide-react";
import ISelect from "./Select";
import IInput from "./Input";
import Pagination from "./Pagination";
import IButton from "./Button";
import Title from "./Title";
import Paragraph from "./Paragraph";
import DatePicker from "./DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
// import ICheckbox from "./Checkbox";
// import { useUser } from "@/shared/hooks/useUser";
import ITooltip from "./Tooltip";
import Each from "./Each";
import { Skeleton } from "../ui/skeleton";
// import { DATATABLE_SORT_KEYS } from "@/shared/constants/options";

// Sort constants
const DATATABLE_SORT_KEYS = {
   ASC: 'asc',
   DESC: 'desc'
};

const DataTable = ({
   // TanStack Query integration (required)
   query,

   tableData: clientSideData,

   // Display props
   title,
   description,
   columns = [],
   caption,
   footer,
   tableClassName,
   tableWrapperClassName,
   tableHeaderClassName,
   wrapperClassName,
   paginationClassName,
   emptyMessage = "No data available",
   searchable = true,
   filterable = true,
   filters = [],
   paginated = true,
   initialPageSize = 10,
   showPageSizeSelector = true,
   actions = [],
   actionButtons = [],
   serverSide = true,
   onRowClick,
   selectable = false,
   onSelectionChange,
   expandable = false,
   renderExpandedRow,
   expandedRowClassName,
   isActionEllipsis,
   onMount = () => {},
   ...props
}) => {
   const userRole = props.userRole;

   // State management from store
   const {
      currentPage,
      pageSize: pageSizeState,
      searchTerm,
      activeFilters,
      dateRange,
      selectedRows,
      expandedRows,
      sortField,
      sortOrder,
      setCurrentPage,
      setPageSize,
      setSearchTerm,
      setFilter,
      setDateRange,
      clearFilters,
      toggleRowExpansion,
      selectAll,
      clearSelection,
      selectRow,
      deselectRow,
      toggleSort,
      hasActiveFilters: storeHasActiveFilters,
   } = useDatatableStore();

   const [isPending, startTransition] = useTransition();
   const hasInitializedPageSize = useRef(false);
   const parsedInitialPageSize = Number(initialPageSize);
   const normalizedInitialPageSize =
      Number.isFinite(parsedInitialPageSize) && parsedInitialPageSize > 0
         ? parsedInitialPageSize
         : 10;
   const effectivePageSize = hasInitializedPageSize.current ? pageSizeState : normalizedInitialPageSize;

   // Debounced search for better UX
   const debouncedSearchTerm = useDebounce(searchTerm, 500);
   const debouncedDateRange = useDebounce(dateRange, 500);

   // Ensure each table instance can define its own default page size
   useEffect(() => {
      if (hasInitializedPageSize.current) return;

      hasInitializedPageSize.current = true;
      if (pageSizeState !== normalizedInitialPageSize) {
         setPageSize(normalizedInitialPageSize);
      }
   }, [normalizedInitialPageSize, pageSizeState, setPageSize]);

   const normalizedQueryParams = useMemo(() => {
      const params = query?.params ? { ...query.params } : {};

      // Keep pagination payload consistent by using only one page-size key.
      delete params.limit;
      delete params.pageSize;
      delete params.page_size;
      delete params.per_page;

      return {
         ...params,
         page: currentPage,
         limit: effectivePageSize,
      };
   }, [query?.params, currentPage, effectivePageSize]);

   // TanStack Query integration (server-side only)
   const {
      data: serverSideData,
      isLoading,
      isFetching,
      isError,
      error,
   } = query?.useQuery
      ? query.useQuery(
           normalizedQueryParams,
           {
              refetchOnMount: true,
              enabled: serverSide,
              ...query?.options,
           },
        )
      : {};

   // Helper function to get nested value
   const getNestedValue = useCallback((obj, path) => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
   }, []);

   // Call onMount callback when component mounts
   useEffect(() => {
      onMount(serverSideData || clientSideData);
   }, [onMount, serverSideData, clientSideData]);

   // Reset selected rows when page changes
   useEffect(() => {
      clearSelection();
   }, [currentPage, clearSelection]);

   // Notify parent of selection changes
   useEffect(() => {
      if (onSelectionChange) {
         onSelectionChange(selectedRows);
      }
   }, [selectedRows, onSelectionChange]);

   const sortTableData = useCallback(
      (data) => {
         if (!sortField || !sortOrder) return data;
         
         return [...data].sort((a, b) => {
            const aValue = getNestedValue(a, sortField);
            const bValue = getNestedValue(b, sortField);
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
            
            return sortOrder === DATATABLE_SORT_KEYS.DESC ? -comparison : comparison;
         });
      },
      [sortField, sortOrder, getNestedValue],
   );

   const paginateTableData = useCallback(
      (data) => data.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize),
      [currentPage, effectivePageSize],
   );

   const { paginationData, isQueryLoading, tableData } = useMemo(() => {
      const sortedData = serverSide 
         ? serverSideData?.data 
         : sortTableData(clientSideData);
      
      return {
         paginationData: serverSideData?.pagination || {},
         isQueryLoading: isLoading || isFetching,
         tableData: serverSide
            ? serverSideData?.data
            : paginated
            ? paginateTableData(sortedData)
            : sortedData,
      };
   }, [serverSideData, isLoading, isFetching, clientSideData, paginated, paginateTableData, sortTableData]);

   const handleSelectAll = useCallback(
      (checked) => {
         if (checked) {
            const allIds = tableData?.map((item) => item.id) || [];
            selectAll(allIds);
         } else {
            clearSelection();
         }
      },
      [tableData, selectAll, clearSelection],
   );

   const handleSelectRow = useCallback(
      (id, checked) => {
         if (checked) {
            selectRow(id);
         } else {
            deselectRow(id);
         }
      },
      [selectRow, deselectRow],
   );

   const isAllSelected = useMemo(() => {
      return tableData?.length > 0 && selectedRows.length === tableData.length;
   }, [tableData, selectedRows]);

   const isSomeSelected = useMemo(() => {
      return selectedRows.length > 0 && selectedRows.length < (tableData?.length || 0);
   }, [tableData, selectedRows]);

   const renderCellValue = useCallback(
      (item, column) => {
         if (column.headerRender) {
            return column.headerRender();
         }

         if (column.render) {
            return column.render(getNestedValue(item, column.key), item);
         }

         if (column.accessor) {
            return column.accessor(item);
         }

         return getNestedValue(item, column.key);
      },
      [getNestedValue],
   );

   const calculateFooterValue = useCallback((column) => {
      if (column.footerRender) {
         return column.footerRender(tableData);
      }

      if (column.sum) {
         const sum = tableData.reduce((acc, item) => {
            const value =
               typeof getNestedValue(item, column.key) === "number"
                  ? getNestedValue(item, column.key)
                  : parseFloat(getNestedValue(item, column.key)) || 0;
            return acc + value;
         }, 0);
         return column.formatSum ? column.formatSum(sum) : sum;
      }

      return column.footerValue || "";
   }, []);

   const handleFilterChange = useCallback(
      (filterKey, value) => {
         startTransition(() => {
            setFilter(filterKey, value);
         });
      },
      [setFilter],
   );

   const handleClearFilters = useCallback(() => {
      clearFilters();
   }, [clearFilters]);

   const hasActiveFilters = storeHasActiveFilters();

   const clientSidePaginate = useMemo(() => {
      if (!paginated || serverSide) return tableData;

      return {
         currentPage,
         totalPages: Math.ceil(clientSideData?.length / effectivePageSize),
         total: clientSideData?.length || 0,
         pageSize: effectivePageSize,
      };
   }, [clientSideData, currentPage, effectivePageSize, tableData]);

   // Add actions column if actions are provided
   const columnsWithActions = useMemo(() => {
      let cols = [...columns];

      // Add expand/collapse column if expandable
      if (expandable) {
         cols = [
            {
               key: "expand",
               title: "",
               width: "50px",
               cellClassName: "text-center",
               render: (_, item) => (
                  <ITooltip label={expandedRows.includes(item.id) ? "Collapse" : "Expand"}>
                     <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={(e) => {
                           e.stopPropagation();
                           toggleRowExpansion(item.id);
                        }}
                     >
                        {expandedRows.includes(item.id) ? (
                           <ChevronDown className='h-4 w-4' />
                        ) : (
                           <ChevronRight className='h-4 w-4' />
                        )}
                     </Button>
                  </ITooltip>
               ),
            },
            ...cols,
         ];
      }

      // Add checkbox column if selectable
      if (selectable) {
         cols = [
            {
               key: "select",
               title: "",
               width: "50px",
               cellClassName: "text-center",
               headerRender: () => (
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label='Select all rows' />
               ),
               render: (_, item) => (
                  <Checkbox
                     checked={selectedRows.includes(item.id)}
                     onCheckedChange={(checked) => handleSelectRow(item.id, checked)}
                     aria-label={`Select row ${item.id}`}
                  />
               ),
            },
            ...cols,
         ];
      }

      if (actions.length === 0) return cols;

      return [
         ...cols,
         {
            key: "actions",
            title: "Actions",
            width: "100px",
            cellClassName: "text-center",
            render: (_, item) =>
               isActionEllipsis ? (
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                           <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align='end'>
                        <Each
                           of={actions}
                           noFallback
                           render={(action, index) => {
                              const isShown = action.show ? action.show(item) : true;
                              const roleAuthorized = action.roles ? action.roles.includes(userRole) : true;

                              return (
                                 isShown &&
                                 roleAuthorized && (
                                    <DropdownMenuItem
                                       key={index}
                                       onSelect={() => {
                                          setTimeout(() => {
                                             action.action?.(item);
                                          }, 100);
                                       }}
                                       className={cn(action.className)}
                                    >
                                       {action.icon && <action.icon className='mr-2 size-4 text-inherit' />}
                                       {action.label}
                                    </DropdownMenuItem>
                                 )
                              );
                           }}
                        />
                     </DropdownMenuContent>
                  </DropdownMenu>
               ) : (
                  <div className='flex items-center justify-center gap-4 px-6'>
                     <Each
                        of={actions}
                        noFallback
                        render={(action, index) => {
                           const isShown = action.show ? action.show(item) : true;
                           const roleAuthorized = action.roles ? action.roles.includes(userRole) : true;
                           return (
                              isShown &&
                              roleAuthorized && (
                                 <IButton
                                    showLoading={false}
                                    key={index}
                                    variant={action.variant || "ghost"}
                                    size='sm'
                                    onClick={() => action.action?.(item)}
                                    className={cn(action.className, "px-0!")}
                                 >
                                    {action.icon && <action.icon className='size-4 text-inherit' />}
                                 </IButton>
                              )
                           );
                        }}
                     />
                  </div>
               ),
         },
      ];
   }, [
      columns,
      actions,
      expandable,
      expandedRows,
      toggleRowExpansion,
      selectable,
      isAllSelected,
      handleSelectAll,
      selectedRows,
      handleSelectRow,
      userRole,
   ]);

   return (
      <div className={cn("w-full relative z-20", wrapperClassName)}>
         <header className={cn("mb-4", tableHeaderClassName)}>
            {(title || description) && (
               <div className='mb-3'>
                  {title && <Title>{title}</Title>}
                  {description && <Paragraph>{description}</Paragraph>}
               </div>
            )}

            {/* Filters and Search */}
            {(searchable || filterable || filters.length > 0 || actionButtons.length > 0) && (
               <div className='flex flex-col gap-4'>
                  <div className='flex items-end gap-4'>
                     {/* Search Input */}
                     {searchable && (
                        <div className='w-full flex'>
                           <IInput
                              useForm={false}
                              placeholder='Search...'
                              className='bg-white !text-xs text-black w-70'
                              prefix={<SearchIcon className='size-4 text-black' />}
                              value={searchTerm}
                              onChange={(e) => {
                                 startTransition(() => {
                                    setSearchTerm(e.target.value);
                                 });
                              }}
                           />
                        </div>
                     )}

                     {/* Select Filters */}
                     {filterable && filters.length > 0 && (
                        <div className='flex items-center gap-2'>
                           {hasActiveFilters && (
                              <Button
                                 variant='ghost'
                                 size='sm'
                                 onClick={handleClearFilters}
                                 className='h-6 px-2 text-xs text-destructive mr-auto hover:bg-transparent hover:text-destructive/60'
                              >
                                 <XIcon className='size-4' />
                                 Clear Filters
                              </Button>
                           )}

                           <Each
                              of={filters}
                              noFallback
                              render={(filter) => {
                                 if (filter.type === "date") {
                                    return (
                                       <DatePicker
                                          mode='range'
                                          key={filter.key}
                                          label={null}
                                          showClear={false}
                                          useForm={false}
                                          value={dateRange}
                                          defaultMonth={new Date()}
                                          onChange={(date) => {
                                             startTransition(() => {
                                                setDateRange(date?.from, date?.to);
                                             });
                                          }}
                                          placeholder='Select date range'
                                          triggerClassName='text-xs bg-white text-black [&>svg]:!text-black hover:bg-primary/10'
                                          suffix={<Calendar className='size-3.5' />}
                                       />
                                    );
                                 }

                                 if (filter.type === "boolean") {
                                    return (
                                       <div key={filter.key} className="flex items-center space-x-2">
                                          <Checkbox
                                             id={filter.key}
                                             checked={activeFilters[filter.key] || false}
                                             onCheckedChange={(checked) =>
                                                handleFilterChange(filter.key, checked ? true : false)
                                             }
                                          />
                                          <label 
                                             htmlFor={filter.key}
                                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                             {filter.label}
                                          </label>
                                       </div>
                                    );
                                 }

                                 return (
                                    <ISelect
                                       key={filter.key}
                                       options={filter.options}
                                       value={activeFilters[filter.key] || "all"}
                                       onValueChange={(value) => handleFilterChange(filter.key, value?.value ?? "")}
                                       placeholder={`Select ${filter.label}`}
                                       labelAsNull
                                       showAll={true}
                                       allValue='all'
                                       contentClassName='bg-white'
                                       variant='destructive'
                                       triggerClassName={`text-xs bg-primary text-white [&>svg]:!text-white hover:bg-primary/90 ${
                                          activeFilters[filter.key] && activeFilters[filter.key] !== "all"
                                             ? "font-semibold"
                                             : ""
                                       }`}
                                    />
                                 );
                              }}
                           />
                        </div>
                     )}

                     {/* Action Buttons */}
                     {actionButtons.length > 0 && (
                        <div className='ml-auto flex items-center gap-2'>
                           <Each
                              of={actionButtons.filter((i) => !i.hidden)}
                              noFallback
                              render={(button, index) => {
                                 if (button.roles && !button.roles.includes(userRole)) {
                                    return null;
                                 }

                                 return (
                                    <IButton
                                       key={index}
                                       variant={button.variant ?? "default"}
                                       onClick={button.onClick}
                                       className={button.className}
                                       icon={button.icon}
                                    >
                                       {button.label}
                                    </IButton>
                                 );
                              }}
                           />
                        </div>
                     )}
                  </div>
               </div>
            )}
         </header>

         {/* Table */}
         <div
            className={cn(
               "overflow-hidden w-full md:max-w-[calc(100vw-7rem)] border rounded-lg relative z-10 bg-white shadow",
               tableWrapperClassName,
            )}
         >
            <Table className={cn(tableClassName, "w-full min-w-120")} {...props}>
               {caption && <TableCaption>{caption}</TableCaption>}

               <TableHeader>
                  <TableRow className='divide-x'>
                     <Each
                        of={columnsWithActions}
                        noFallback
                        render={(column, index) => {
                           const isSorted = sortField === (column?.sortKey || column.key);
                           const sortIcon = isSorted
                              ? sortOrder === DATATABLE_SORT_KEYS.ASC
                                 ? ArrowUp
                                 : ArrowDown
                              : ArrowDownUp;
                           const SortIcon = sortIcon;

                           return (
                              <TableHead
                                 key={column.key || column.title}
                                 className={cn(
                                    column.headerClassName,
                                    "bg-primary px-3 text-white",
                                    !actions.length && index === columnsWithActions.length - 1 && "text-end",
                                    column.sortable === true && "cursor-pointer hover:bg-primary/90 transition-colors",
                                 )}
                                 style={{ width: column.width }}
                                 onClick={() => column.sortable && toggleSort(column?.sortKey || column.key)}
                              >
                                 <div className='flex items-center justify-between gap-2'>
                                    <span>{column.headerRender ? column.headerRender() : column.title}</span>
                                    {column.sortable === true && column.title !== "Actions" && (
                                       <SortIcon
                                          className={cn(
                                             "size-4 flex-shrink-0 text-white",
                                          )}
                                       />
                                    )}
                                 </div>
                              </TableHead>
                           );
                        }}
                     />
                  </TableRow>
               </TableHeader>

               <TableBody className={cn(isPending && "opacity-50 transition-opacity")}>
                  {isQueryLoading ? (
                     Array.from({ length: 3 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                           <TableCell colSpan={columnsWithActions.length} className='py-3'>
                              <div className='flex items-center gap-3'>
                                 <Skeleton className='h-8 w-8 rounded' />
                                 <div className='flex-1 space-y-2'>
                                    <Skeleton className='h-5 w-3/5' />
                                    <Skeleton className='h-4 w-2/5' />
                                 </div>
                                 <Skeleton className='h-8 w-20' />
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : tableData?.length > 0 ? (
                     <Each
                        of={tableData}
                        noFallback
                        render={(item, index) => (
                           <React.Fragment key={item.id || item.key || index}>
                              <TableRow onClick={() => onRowClick?.(item)} className={cn(onRowClick && "cursor-pointer", index % 2 === 1 && "bg-gray-200")}>
                                 <Each
                                    of={columnsWithActions}
                                    noFallback
                                    render={(column, columnIndex) => (
                                       <TableCell
                                          key={column.key || column.title}
                                          className={cn(
                                             column.cellClassName,
                                             "py-2 max-w-40 px-3 text-center font-medium text-gray-800 align-middle",
                                             !actions.length &&
                                                columnIndex === columnsWithActions.length - 1 &&
                                                "text-end",
                                          )}
                                       >
                                          {renderCellValue(item, column) || (
                                             <span className='text-gray-400'>UNAVAILABLE</span>
                                          )}
                                       </TableCell>
                                    )}
                                 />
                              </TableRow>
                              {expandable && expandedRows.includes(item.id) && (
                                 <TableRow className={cn("bg-muted/30", expandedRowClassName)}>
                                    <TableCell colSpan={columnsWithActions.length} className='p-4'>
                                       {renderExpandedRow?.(item)}
                                    </TableCell>
                                 </TableRow>
                              )}
                           </React.Fragment>
                        )}
                     />
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={columnsWithActions.length}
                           className='text-center py-8 text-muted-foreground'
                        >
                           {hasActiveFilters ? "No results found with current filters" : emptyMessage}
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>

               {(footer || columns.some((col) => col.sum || col.footerValue || col.footerRender)) && (
                  <TableFooter>
                     <TableRow>
                        <Each
                           of={columnsWithActions}
                           noFallback
                           render={(column, index) => {
                              const columnsHasFooter = columns.some(
                                 (col) => col.sum || col.footerValue || col.footerRender,
                              );

                              if (!columnsHasFooter && index > 0) return null;

                              return (
                                 <TableCell
                                    key={column.key || column.title}
                                    className={cn(column.footerClassName)}
                                    colSpan={footer && index === 0 ? columnsWithActions.length : undefined}
                                 >
                                    {!columnsHasFooter
                                       ? footer
                                       : footer && index === columns.length - 1
                                         ? footer.value
                                         : calculateFooterValue(column)}
                                 </TableCell>
                              );
                           }}
                        />
                     </TableRow>
                  </TableFooter>
               )}
            </Table>
         </div>

         {/* Pagination */}
         {paginated && (
            <Pagination
               className={cn(paginationClassName)}
               currentPage={serverSide ? currentPage : clientSidePaginate.currentPage}
               totalPages={serverSide ? paginationData.totalPages || 0 : clientSidePaginate.totalPages || 0}
               pageSize={effectivePageSize}
               totalCount={serverSide ? paginationData.total || 0 : clientSidePaginate.total || 0}
               isLoading={isQueryLoading}
               showPageSizeSelector={showPageSizeSelector}
               onPageChange={(page) => {
                  startTransition(() => {
                     setCurrentPage(page);
                  });
               }}
               onPageSizeChange={(newPageSize) => {
                  startTransition(() => {
                     setPageSize(newPageSize);
                     setCurrentPage(1);
                  });
               }}
            />
         )}
      </div>
   );
};

export default DataTable;
