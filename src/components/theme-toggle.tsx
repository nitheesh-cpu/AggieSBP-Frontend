"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // resolvedTheme is what is showing, including when it follows the device.
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 bg-transparent text-current opacity-80 hover:opacity-100 hover:bg-current/10 hover:text-current"
      >
        <Sun strokeWidth={1.5} className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 bg-transparent text-current opacity-80 hover:opacity-100 hover:bg-current/10 hover:text-current"
    >
      <Sun strokeWidth={1.5} className="h-4 w-4 rotate-0 scale-100 transition-[transform,opacity] duration-150 dark:-rotate-90 dark:scale-0" />
      <Moon strokeWidth={1.5} className="absolute h-4 w-4 rotate-90 scale-0 transition-[transform,opacity] duration-150 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
