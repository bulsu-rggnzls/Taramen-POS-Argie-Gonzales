import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, XIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format, isSameDay } from "date-fns";
import IButton from "./Button";
import { FORM } from "@/shared/constants/message";

const DateRangePicker = ({
   value,
   onChange,
   label = "Date Range",
   placeholder = "Select date range",
   className,
   triggerClassName,
   dropdownClassName,
   name,
   minDate,
   maxDate,
   range = true,
}) => {
   const [isOpen, setIsOpen] = useState(false);

   const formContext = useFormContext();
   const formValue = formContext && name ? formContext.watch(name) : null;
   const setValue = formContext?.setValue;
   const clearErrors = formContext?.clearErrors;

   const formErrors = formContext?.formState?.errors || {};
   const fieldError = formErrors?.[name];

   const currentValue = formContext && name ? formValue : value;

   const formatDate = (date) => {
      if (!date) return "";
      return format(new Date(date), "MMM dd, yyyy");
   };

   const getDisplayText = () => {
      if (range && currentValue?.from && currentValue?.to) {
         if (isSameDay(new Date(currentValue.from), new Date(currentValue.to))) {
            return formatDate(currentValue.from);
         }

         return `${formatDate(currentValue.from)} - ${formatDate(currentValue.to)}`;
      }

      if (range && currentValue?.from) {
         return formatDate(currentValue.from);
      }

      return !range ? formatDate(currentValue) || placeholder : placeholder;
   };

   const handleSelect = (range) => {
      if (formContext && name && setValue) {
         setValue(name, range);
         clearErrors?.(name);
      }

      if (range?.from && range?.to) {
         setIsOpen(false);
      }

      onChange?.(range);
   };

   const clearSelection = (e) => {
      e.stopPropagation();
      const emptyRange = { from: null, to: null };
      if (formContext && name && setValue) {
         setValue(name, emptyRange);
         clearErrors?.(name);
      }

      onChange?.(emptyRange);
   };

   return (
      <div className={cn("relative", className)}>
         {label && <Label className='mb-2 block'>{label}</Label>}

         <div className='flex items-center space-x-2 relative'>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
               <PopoverTrigger asChild>
                  <div className='w-full'>
                     <IButton
                        variant='outline'
                        className={cn(
                           "w-full justify-start text-left font-normal rounded-md relative h-10",
                           !currentValue?.from && "text-muted-foreground",
                           triggerClassName,
                           fieldError && "border-red-500 focus:ring-red-500",
                        )}
                     >
                        <CalendarIcon className='mr-1 h-4 w-4' />
                        {getDisplayText()}

                        {(currentValue?.from || currentValue?.to) && (
                           <Button
                              variant='ghost'
                              size='sm'
                              onClick={clearSelection}
                              className='h-10 w-10 p-0 absolute right-0 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100'
                           >
                              <XIcon className='h-4 w-4' />
                           </Button>
                        )}
                     </IButton>
                     {fieldError && <p className='text-xs font-medium text-red-500 mt-1'>{FORM.REQUIRED}</p>}
                  </div>
               </PopoverTrigger>

               <PopoverContent className={cn("w-auto p-0", dropdownClassName)} align='start'>
                  <Calendar
                     mode={range ? "range" : "single"}
                     selected={currentValue}
                     onSelect={handleSelect}
                     numberOfMonths={1}
                     defaultMonth={currentValue?.from ? new Date(currentValue.from) : new Date()}
                     disabled={{ before: minDate, after: maxDate }}
                  />
               </PopoverContent>
            </Popover>
         </div>
      </div>
   );
};

export default DateRangePicker;