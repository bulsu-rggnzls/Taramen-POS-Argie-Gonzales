import { useMemo, useEffect, isValidElement, Fragment } from "react";
import { Search, X } from "lucide-react";
import ICard from "./Card";
import IInput from "./Input";
import ISelect from "./Select";
import IButton from "./Button";
import DateRangePicker from "./DateRangePicker";
import { useFilterStore } from "@/stores/useFilterStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { cn } from "@/shared/lib/utils";

const renderIcon = (icon, className = "size-4 text-slate-400") => {
   if (!icon) return null;
   if (isValidElement(icon)) return icon;
   const isComponent = typeof icon === "function" || typeof icon === "object";
   if (isComponent) {
      const Icon = icon;
      return <Icon className={className} />;
   }
   return null;
};

export default function Filter({
   filterConfig = [],
   onFilterChange,
   searchPlaceholder = "Search...",
   showSearch = true,
   searchClassName = "",
   searchPosition = "start",
   searchIcon = <Search className='size-5 text-gray-400' />,
   showDateRange = false,
   className = "",
   debounceDelay = 500,
   actions = [],
   actionsClassName = "",
   gridClassName = "",
   showClearFilters = true,
   defaultFilters = {},
}) {
   const {
      searchTerm,
      filters,
      dateRange,
      setSearchTerm,
      setFilter,
      setFilters,
      setDateRange,
      resetFilters,
      hasActiveFilters,
   } = useFilterStore();

   const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);
   const debouncedFilters = useDebounce(filters, debounceDelay);
   const debouncedDateRange = useDebounce(dateRange, debounceDelay);

   // Initialize with default filters on mount
   useEffect(() => {
      if (defaultFilters && Object.keys(defaultFilters).length > 0) {
         setFilters(defaultFilters);
      }
   }, []);

   useEffect(() => {
      onFilterChange?.({
         searchTerm: debouncedSearchTerm,
      });
   }, [debouncedSearchTerm]);

   useEffect(() => {
      onFilterChange?.({
         filters: debouncedFilters,
      });
   }, [debouncedFilters]);

   useEffect(() => {
      onFilterChange?.({
         dateRange: {
            start_date: debouncedDateRange?.from || null,
            end_date: debouncedDateRange?.to || null,
         },
      });
   }, [debouncedDateRange]);

   const gridCols = useMemo(() => {
      let count = filterConfig.length;
      if (showSearch) count++;
      if (showDateRange) count++;
      if (actions.length > 0) count++;

      if (count <= 2) return "md:grid-cols-2";
      if (count === 3) return "md:grid-cols-3";
      if (count === 4) return "md:grid-cols-2 lg:grid-cols-4";

      return "md:grid-cols-5";
   }, [filterConfig.length, showSearch, showDateRange]);

   const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
   };

   const handleFilterChange = (filterName, value) => {
      setFilter(filterName, value);
   };

   const handleDateRangeChange = (range) => {
      setDateRange(range?.from, range?.to);
   };

   const handleResetFilters = () => {
      resetFilters();
      onFilterChange?.({ searchTerm: "", filters: {}, dateRange: { from: null, to: null } });
   };

   return (
      <div className='relative'>
         <ICard cardClassName={cn("bg-white shadow-xl p-6", className)} cardContentClassName='px-0'>
            <section className={cn("grid grid-cols-1 gap-4", gridCols, gridClassName)}>
               {showSearch && searchPosition === "start" && (
                  <IInput
                     prefix={searchIcon}
                     placeholder={searchPlaceholder}
                     value={searchTerm}
                     onChange={handleSearchChange}
                     preventEnterSubmit
                     useForm={false}
                     wrapperClassName={searchClassName}
                  />
               )}

               {filterConfig.map((filter) => {
                  if (filter.type === "select") {
                     return (
                        <ISelect
                           label={filter.label}
                           useForm={false}
                           key={filter.name}
                           prefix={renderIcon(filter.icon)}
                           name={filter.name}
                           options={filter.options || []}
                           placeholder={filter.placeholder}
                           value={filters[filter.name] ?? filter.value ?? ""}
                           onValueChange={(value) => handleFilterChange(filter.name, value?.value ?? value ?? "")}
                           showAll={filter.showAll ?? true}
                           allLabel={filter.allLabel}
                           allValue={filter.allValue}
                           labelAsNull={filter.labelAsNull}
                           className={filter.wrapperClassName || filter.className}
                           triggerClassName={filter.triggerClassName}
                           contentClassName={filter.contentClassName}
                           {...(filter.selectProps || {})}
                        />
                     );
                  }

                  if (filter.type === "input") {
                     return (
                        <IInput
                           label={filter.label}
                           useForm={false}
                           key={filter.name}
                           prefix={renderIcon(filter.icon)}
                           name={filter.name}
                           labelClassName={filter.labelClassName}
                           wrapperClassName={filter.wrapperClassName || filter.className}
                           placeholder={filter.placeholder}
                           value={filters[filter.name] ?? filter.value ?? ""}
                           onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                           className={cn("h-11 border-gray-300", filter.inputClassName)}
                           inputWrapperClassName={filter.inputWrapperClassName}
                           maxLength={filter.maxLength}
                           preventEnterSubmit
                           showError={false}
                           {...(filter.inputProps || {})}
                        />
                     );
                  }

                  if (filter.type === "dateRange") {
                     return (
                        <DateRangePicker
                           label={filter.label ?? null}
                           key={filter.name}
                           value={dateRange}
                           onChange={handleDateRangeChange}
                           placeholder={filter.placeholder || "Select date range"}
                           triggerClassName={cn(
                              "w-full h-10! cursor-pointer [&>svg]:text-current border-outline text-muted-foreground font-normal! bg-muted",
                              filter.wrapperClassName || filter.className,
                           )}
                        />
                     );
                  }

                  if (filter.type === "custom" && typeof filter.render === "function") {
                     return (
                        <div className={filter.wrapperClassName || filter.className} key={filter.name}>
                           {filter.render({
                              onChange: (value) => handleFilterChange(filter.name, value),
                           })}
                        </div>
                     );
                  }

                  return null;
               })}

               {actions.length > 0 && (
                  <div
                     className={cn(
                        "flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-nowrap lg:ml-auto",
                        actionsClassName,
                     )}
                  >
                     {actions.map((action, index) => {
                        const actionKey = action.key || action.label || `action-${index}`;

                        if (typeof action.render === "function") {
                           return <Fragment key={actionKey}>{action.render(action)}</Fragment>;
                        }

                        return (
                           <IButton
                              key={actionKey}
                              variant={action.variant || "outline"}
                              className={cn(
                                 "h-10 sm:h-11 border-slate-300 text-slate-700 hover:bg-slate-50",
                                 action.label ? "px-3 sm:px-4 gap-1.5 sm:gap-2" : "p-2.5",
                                 "text-sm sm:text-base",
                                 action.className,
                              )}
                              onClick={action.onClick}
                              disabled={action.disabled}
                              {...(action.buttonProps || {})}
                           >
                              {action.icon
                                 ? renderIcon(action.icon, action.iconClassName || "w-3.5 h-3.5 sm:w-4 sm:h-4")
                                 : null}
                              {action.label ? <span>{action.label}</span> : null}
                           </IButton>
                        );
                     })}
                  </div>
               )}

               {showSearch && searchPosition === "end" && (
                  <IInput
                     prefix={searchIcon}
                     placeholder={searchPlaceholder}
                     value={searchTerm}
                     onChange={handleSearchChange}
                     preventEnterSubmit
                     useForm={false}
                     wrapperClassName={searchClassName}
                  />
               )}
            </section>

            {showClearFilters && hasActiveFilters() && (
               <IButton
                  variant='ghost'
                  onClick={handleResetFilters}
                  className='flex items-center gap-2 p-0! pt-2! h-auto! text-destructive mt-1 float-end'
               >
                  <X className='size-4' />
                  Clear Filters
               </IButton>
            )}
         </ICard>
      </div>
   );
}

