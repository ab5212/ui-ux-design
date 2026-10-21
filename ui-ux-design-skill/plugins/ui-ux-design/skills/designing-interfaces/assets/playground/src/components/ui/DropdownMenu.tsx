import * as Menu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;

export function DropdownMenuContent({ className, ...props }: Menu.DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={6}
        align="end"
        className={cn(
          "anim-menu z-(--z-dropdown) min-w-48 rounded-lg border bg-surface-raised p-1 text-foreground shadow-md",
          className
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  shortcut,
  icon,
  children,
  ...props
}: Menu.DropdownMenuItemProps & { destructive?: boolean; shortcut?: string; icon?: React.ReactNode }) {
  return (
    <Menu.Item
      className={cn(
        "flex h-9 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm outline-none [&_svg]:size-4",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
        destructive && "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
        className
      )}
      {...props}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {shortcut && <kbd className="font-sans text-xs text-muted-foreground">{shortcut}</kbd>}
    </Menu.Item>
  );
}

export const DropdownMenuSeparator = () => <Menu.Separator className="my-1 h-px bg-border" />;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <Menu.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{children}</Menu.Label>
);
