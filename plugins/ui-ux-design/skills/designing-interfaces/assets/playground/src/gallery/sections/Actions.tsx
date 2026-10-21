import { Copy, Download, MoreHorizontal, Pencil, Plus, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { useToast } from "@/components/ui/Display";
import { Demo, Spec } from "../Section";

const VARIANTS = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const LABEL: Record<(typeof VARIANTS)[number], string> = {
  primary: "Save changes",
  secondary: "Export",
  outline: "Duplicate",
  ghost: "Cancel",
  destructive: "Delete project",
  link: "View details",
};

export function ButtonsDemo() {
  const toast = useToast();
  return (
    <>
      <Demo title="Variants × sizes" note="One primary per view. Hover and press are live.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-start text-muted-foreground">
                <th scope="col" className="w-28 text-start font-medium">Variant</th>
                {SIZES.map((s) => (
                  <th key={s} scope="col" className="text-start font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((v) => (
                <tr key={v}>
                  <th scope="row" className="text-start font-normal"><code className="text-xs">{v}</code></th>
                  {SIZES.map((s) => (
                    <td key={s}><Button variant={v} size={s}>{LABEL[v]}</Button></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Demo>

      <Demo title="States" note="Focus is shown here as forced; tab to see the real :focus-visible ring.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button className="outline-2 outline-offset-2 outline-ring">Focus</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Saving</Button>
          <Button variant="outline">
            <Plus aria-hidden /> With icon
          </Button>
          <Button variant="outline" onClick={() => toast({ message: "Project duplicated", action: { label: "Undo", onClick: () => toast({ message: "Duplicate removed" }) } })}>
            Duplicate (shows toast)
          </Button>
        </div>
      </Demo>

      <Demo title="Icon buttons, menu" note="Icon-only buttons need an accessible name; a tooltip repeats it for mouse users.">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip content="Edit">
            <Button variant="ghost" size="icon" aria-label="Edit"><Pencil aria-hidden /></Button>
          </Tooltip>
          <Tooltip content="Copy link">
            <Button variant="ghost" size="icon" aria-label="Copy link"><Copy aria-hidden /></Button>
          </Tooltip>
          <Tooltip content="Download">
            <Button variant="outline" size="icon" aria-label="Download"><Download aria-hidden /></Button>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions"><MoreHorizontal aria-hidden /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuItem icon={<Pencil aria-hidden />} shortcut="E">Rename</DropdownMenuItem>
              <DropdownMenuItem icon={<Copy aria-hidden />} shortcut="⌘D">Duplicate</DropdownMenuItem>
              <DropdownMenuItem icon={<Download aria-hidden />}>Export as CSV</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive icon={<Trash2 aria-hidden />}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Demo>

      <Spec
        rows={[
          ["height", "32 / 40 / 48 (var(--control-h-*))"],
          ["padding-x", "12 / 16 / 24"],
          ["radius", "rounded-md (6)"],
          ["focus", "2px ring, 2px offset, :focus-visible"],
          ["loading", "width kept, spinner, aria-busy, disabled"],
        ]}
      />
    </>
  );
}
