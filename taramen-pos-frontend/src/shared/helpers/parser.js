import { format, formatDate, isDate, isSameDay, isToday, isYesterday, parseISO } from "date-fns";

const ROUTE_ID_KEY = ":id";

export const priceParser = (current) => {
   return current ? `PHP ${Number(current).toFixed(2)}` : "PHP 0.00";
};

export const dateParser = (dateString, format = "PPp") => {
   const date = new Date(dateString);
   if (!dateString || !isDate(date)) return "---";

   return formatDate(date, format);
};

export const optionParser = (options, value, labelKeys, config = {}, valueAsNum = false) => {
   if (!Array.isArray(options) || options.length === 0) return [];

   return options.map((opt) => {
      let label = "";

      if (Array.isArray(labelKeys)) {
         label = labelKeys
            .map((k) => opt[k])
            .filter(Boolean)
            .join(config?.separator ?? " - ");
      } else {
         const val = opt[labelKeys];
         label = typeof val === "object" ? Object.values(val).join(config?.separator ?? " - ") : String(val ?? "");
      }

      return { value: valueAsNum ? Number(opt[value]) : String(opt[value]), label };
   });
};

export const nestedObjParser = (errorsObj, path) => {
   if (!path) return undefined;
   const parts = path.match(/[^.[\]]+/g) || [];
   return parts.reduce((acc, key) => (acc ? acc[key] : undefined), errorsObj);
};

export const parseArray = (array, key, value) => {
   if (!Array.isArray(array)) return {};

   return array.reduce((acc, item) => {
      acc[item[key]] = item[value];
      return acc;
   }, {});
};

export const arrayFromObject = (obj, key, value) => {
   if (typeof obj !== "object" || obj === null) return [];

   return Object.entries(obj).map(([k, v]) => ({
      [key]: k,
      [value]: v,
   }));
};

export const addOthers = (options, others = "Others") => [...options, { value: "others", label: others }];

export const padwithZero = (num, length = 4) => String(num).padStart(length, "0");

export const getAxiosErrorMessage = (error) => {
   if (error?.code === "ERR_NETWORK") {
      return "The server is currently unreachable. Please check your internet connection and try again later.";
   } else if (error?.response?.data?.errors?.[0]?.message) {
      try {
         const parsed = JSON.parse(error.response.data.errors[0].message);

         if (Array.isArray(parsed) && parsed.length > 0) {
            if (parsed.length === 1) {
               return parsed[0].message;
            }

            return parsed.reduce((acc, err) => {
               const key = Array.isArray(err.path) ? err.path.join(".") : "general";
               acc[key] = err.message;
               return acc;
            }, {});
         }

         return parsed;
      } catch {
         return error.response.data.errors[0].message;
      }
   } else if (error?.response?.data?.message) {
      return error.response.data.message;
   } else if (error?.message) {
      return error.message;
   } else {
      return "An unexpected error occurred.";
   }
};

const stringifyErrorValue = (value) => {
   if (value === null || value === undefined) return "";
   if (typeof value === "string") return value;
   if (typeof value === "number" || typeof value === "boolean") return String(value);

   if (Array.isArray(value)) {
      return value
         .map((item) => stringifyErrorValue(item))
         .filter(Boolean)
         .join(", ");
   }

   if (typeof value === "object") {
      if (typeof value.message === "string" && value.message.trim()) {
         return value.message.trim();
      }

      const parts = Object.entries(value)
         .map(([key, val]) => {
            const parsed = stringifyErrorValue(val);
            return parsed ? `${key}: ${parsed}` : "";
         })
         .filter(Boolean);

      return parts.join(" | ");
   }

   return "";
};

export const normalizeErrorMessage = (errorMessage, fallback = "An unexpected error occurred. Please try again.") => {
   const parsed = stringifyErrorValue(errorMessage);
   return parsed || fallback;
};

export const groupNotifications = (notifications) => {
   return notifications.reduce((groups, notification) => {
      const date = parseISO(notification.date);
      let groupKey = "";

      if (isToday(date)) {
         groupKey = "Today";
      } else if (isYesterday(date)) {
         groupKey = "Yesterday";
      } else {
         // Formats to "June 13, 2024" or any format you prefer
         groupKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
         groups[groupKey] = [];
      }

      groups[groupKey].push(notification);
      return groups;
   }, {});
};

export const parseLegalMessage = (data) => {
   if (!data || !data.sections) {
      return { title: "", sections: [] };
   }

   return {
      ...data,
      // Ensure every section has a standardized structure
      sections: data.sections.map((section) => ({
         id: section.id,
         heading: section.heading || "Untitled Section",
         content: section.content || null,
         items: Array.isArray(section.items) ? section.items : [],
         footer: section.footer || null,
      })),
   };
};

export const datetimeLabelParser = (date, type, dateFormat = "PP", sameDayFormat = "MMMM do, yyyy") => {
   if (!date?.from) return "";

   const fromDate = new Date(date.from);
   const toDate = date.to ? new Date(date.to) : fromDate;
   const normalizedType = String(type ?? "").toLowerCase();

   if (normalizedType === "holiday") {
      return format(fromDate, sameDayFormat);
   }

   // Check if dates are on the same day
   const isSameDay = format(fromDate, "yyyy-MM-dd") === format(toDate, "yyyy-MM-dd");
   const isSameTime = format(fromDate, "HH:mm") === format(toDate, "HH:mm");

   if (isSameDay) {
      // Same date
      const timeRange = isSameTime
         ? format(fromDate, "h:mm a")
         : `${format(fromDate, "h:mm a")} - ${format(toDate, "h:mm a")}`;
      return `${format(fromDate, sameDayFormat)} | ${timeRange}`;
   } else {
      // Different dates: "Feb 7, 2026 - Feb 9, 2026 | 12:00 AM - 1 PM"
      return `${format(fromDate, dateFormat)} | ${format(fromDate, "h:mm a")} - ${format(toDate, dateFormat)} | ${format(toDate, "h:mm a")}`;
   }
};

export const dateLabelParser = (start, end) => {
   if (!start) return "";

   const fromDate = new Date(start);
   const toDate = end ? new Date(end) : fromDate;

   if (isSameDay(fromDate, toDate)) {
      return format(fromDate, "MMMM d, yyyy");
   }

   return `${format(fromDate, "PP")} - ${format(toDate, "PP")}`;
};

export const prepareUrlParams = (params) => {
   const searchParams = new URLSearchParams();

   Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
         if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
         } else {
            searchParams.append(key, value);
         }
      }
   });

   return searchParams.toString();
};

export const parseRouteWithId = (id, routePath, routeKey = ROUTE_ID_KEY) => {
   return routePath.replace(routeKey, id);
};

export const isTimestamp = (val) => {
   if (isNaN(val)) return false;
   return val > 1_000_000_000_000; 
};
