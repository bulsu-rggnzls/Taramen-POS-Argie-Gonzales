import { Skeleton } from "@/components/ui/skeleton";

export default function MenuGridSkeleton({ count = 8 }) {
  return (
    <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-md bg-white shadow-[0_3px_9px_rgba(0,0,0,0.12)]"
        >
          <Skeleton className="h-[6.8rem] w-full rounded-none bg-gray-200" />
          <div className="min-h-[3.8rem] space-y-2 px-3 py-2.5">
            <Skeleton className="h-4 w-4/5 bg-gray-200" />
            <Skeleton className="h-3 w-16 bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
