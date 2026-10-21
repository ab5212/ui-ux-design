import { cn } from "@/lib/cn";

// Google Material Symbols (https://fonts.google.com/icons), loaded in index.html. Size follows font-size (text-base, text-xl...).
type IconProps = { className?: string; "aria-hidden"?: boolean };
const icon = (name: string) => ({ className }: IconProps) => (
  <span aria-hidden className={cn("icon material-symbols-rounded", className)}>{name}</span>
);

export const AlertCircle = icon("error");
export const AlertTriangle = icon("warning");
export const ArrowDown = icon("arrow_downward");
export const ArrowUp = icon("arrow_upward");
export const BarChart3 = icon("bar_chart");
export const Bell = icon("notifications");
export const CheckCircle2 = icon("check_circle");
export const ChevronDown = icon("expand_more");
export const ChevronLeft = icon("chevron_left");
export const ChevronRight = icon("chevron_right");
export const Copy = icon("content_copy");
export const Download = icon("download");
export const FileText = icon("description");
export const FolderPlus = icon("create_new_folder");
export const Home = icon("home");
export const Info = icon("info");
export const Menu = icon("menu");
export const MoreHorizontal = icon("more_horiz");
export const Pencil = icon("edit");
export const Plus = icon("add");
export const Search = icon("search");
export const Settings = icon("settings");
export const SlidersHorizontal = icon("tune");
export const Trash2 = icon("delete");
export const Users = icon("group");
export const X = icon("close");
export const XCircle = icon("cancel");
