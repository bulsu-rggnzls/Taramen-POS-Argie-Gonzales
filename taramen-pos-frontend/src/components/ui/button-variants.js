import { cva } from "class-variance-authority";

export const outlineButtonVariant =
   "text-sm h-9 px-4 py-2 has-[>svg]:px-3 font-semibold rounded border border-outline bg-background shadow-xs hover:brightness-90 text-black dark:bg-input/30 dark:border-input dark:hover:bg-input/50";

export const buttonVariants = cva(
   "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded !font-semibold text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
   {
      variants: {
         variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/60",
            defaultForeground: "bg-primary-foreground text-primary shadow-xs hover:bg-primary-foreground/70",
            info: "bg-blue-600 text-white shadow-xs hover:bg-blue-500",
            destructive:
               "bg-destructive text-white shadow-xs hover:bg-destru ctive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: outlineButtonVariant,
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline",
            emphasis: "bg-emphasis text-primary-foreground shadow-xs hover:bg-emphasis/80",
            dark: "bg-black text-white shadow-xs hover:bg-gray-900",
            taramenRed: "bg-taramen-red text-white shadow-xs hover:bg-taramen-red/90",
         },
         size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
         },
      },
      defaultVariants: {
         variant: "default",
         size: "default",
      },
   }
);

export default buttonVariants;
