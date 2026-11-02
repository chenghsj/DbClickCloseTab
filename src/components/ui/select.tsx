import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  iconOnly = false,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & { iconOnly?: boolean }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-8 min-w-32 items-center justify-between gap-2 rounded-lg border border-input px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground motion-reduce:transition-none",
        !iconOnly && "bg-background dark:bg-input/30",
        iconOnly && "size-8 min-w-0 justify-center border-transparent bg-transparent px-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset data-[keyboard-focus=false]:focus-visible:border-transparent data-[keyboard-focus=false]:focus-visible:ring-0 [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      {iconOnly ? null : <SelectPrimitive.Icon asChild>
        <ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>}
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-32 w-(--radix-select-trigger-width) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="max-h-(--radix-select-content-available-height) overflow-y-auto p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon aria-hidden="true" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

const SelectGroup = SelectPrimitive.Group;

export { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue };
