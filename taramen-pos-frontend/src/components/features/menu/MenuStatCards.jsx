import ICard from "@/components/custom/Card";
import Paragraph from "@/components/custom/Paragraph";
import Title from "@/components/custom/Title";
import { cn } from "@/lib/utils";

export default function MenuStatCards({ items = [], className = "" }) {
  return (
    <section className={cn("grid grid-cols-4 gap-3", className)}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <ICard
            key={item.label}
            cardClassName="rounded-xl border border-gray-100 bg-white shadow-sm"
            cardContentClassName="p-3 pt-3"
          >
            <div className="flex items-center justify-between">
              <Paragraph size="xs" className="font-semibold uppercase text-gray-500">
                {item.label}
              </Paragraph>
              {Icon ? <Icon className={cn("size-4", item.iconClassName)} /> : null}
            </div>
            <Title size="xl" className="mt-2 text-gray-950">
              {item.value}
            </Title>
          </ICard>
        );
      })}
    </section>
  );
}
