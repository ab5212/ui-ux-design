import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "@/components/ui/icons";

/** Header is a real button inside a heading; chevron rotates; multiple items can be open. */
export function Accordion({ items }: { items: { id: string; title: string; content: React.ReactNode }[] }) {
  return (
    <AccordionPrimitive.Root type="multiple" className="divide-y rounded-xl border bg-surface">
      {items.map((it) => (
        <AccordionPrimitive.Item key={it.id} value={it.id}>
          <AccordionPrimitive.Header asChild>
            <h3>
              <AccordionPrimitive.Trigger className="group flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-start text-sm font-medium hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                {it.title}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) ease-(--ease-standard) group-data-[state=open]:rotate-180"
                />
              </AccordionPrimitive.Trigger>
            </h3>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="px-4 pb-4 text-sm text-muted-foreground">{it.content}</AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
