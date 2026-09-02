"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  triggerClassName?: string;
  menuClassName?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  triggerClassName,
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!open || !containerRef.current || !menuRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + 8;
    let left = align === "right" ? triggerRect.right - menu.offsetWidth : triggerRect.left;

    if (left + menu.offsetWidth > viewportWidth - 8) {
      left = viewportWidth - menu.offsetWidth - 8;
    }
    if (left < 8) left = 8;

    if (top + menu.offsetHeight > viewportHeight - 8) {
      top = triggerRect.top - menu.offsetHeight - 8;
    }

    setMenuStyle({ position: "fixed", top, left, zIndex: 9999 });
  }, [open, align]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, updatePosition]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg text-sm text-muted transition-colors hover:text-foreground",
          triggerClassName
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={menuStyle}
          className={cn(
            "min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface-2 p-1 shadow-lg shadow-black/40",
            menuClassName
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-surface-3",
                item.danger ? "text-danger hover:bg-danger/10" : "text-foreground/90",
                item.disabled && "pointer-events-none opacity-50"
              )}
            >
              {item.icon && <span className="text-muted">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
