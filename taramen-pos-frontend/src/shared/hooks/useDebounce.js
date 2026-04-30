import { useEffect, useState } from "react";

export function useDebounce(value, duration) {
   const [debouncedValue, setDebouncedValue] = useState(value);

   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedValue(value);
      }, duration);

      return () => {
         clearTimeout(handler);
      };
   }, [value, duration]);

   return debouncedValue;
}
