"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

export function ThemeDemo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-semibold text-heading">Theme Demo</h2>
        <p className="text-body">
          This section showcases how different UI elements adapt to theme
          changes.
        </p>
        <div className="flex gap-4 justify-center items-center">
          <p className="text-sm text-body">Current theme: {theme}</p>
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Toggle Theme
          </Button>
        </div>
      </div>

      {/* Simple dark mode test */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-black dark:text-white mb-4">Dark Mode Test</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This text should change color based on the theme.
        </p>
        <div className="flex gap-2">
          <Badge className="bg-blue-600 dark:bg-blue-500 text-white">
            Blue Badge
          </Badge>
          <Badge className="bg-green-600 dark:bg-green-500 text-white">
            Green Badge
          </Badge>
          <Badge className="bg-red-600 dark:bg-red-500 text-white">
            Red Badge
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-heading mb-3">
            Course Info
          </h3>
          <p className="text-body mb-4">
            CSCE 121: Introduction to Programming Design and Concepts
          </p>
          <div className="flex gap-2 mb-4">
            <Badge className="bg-button-primary text-button-primary-text">
              4 Credits
            </Badge>
            <Badge variant="outline" className="border-border text-body">
              Required
            </Badge>
          </div>
          <Button className="w-full bg-button-primary text-button-primary-text hover:bg-maroon-light">
            View Details
          </Button>
        </Card>

        {/* Card 2 */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-heading mb-3">
            Professor Rating
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-body">Teaching Quality</span>
              <span className="text-heading font-medium">4.5/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Course Difficulty</span>
              <span className="text-heading font-medium">3.2/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Would Take Again</span>
              <span className="text-heading font-medium">85%</span>
            </div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-heading mb-3">
            Grade Distribution
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-body">A</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-border rounded">
                  <div className="w-3/4 h-full bg-button-primary rounded"></div>
                </div>
                <span className="text-heading text-sm">32%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-body">B</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-border rounded">
                  <div className="w-1/2 h-full bg-button-primary rounded"></div>
                </div>
                <span className="text-heading text-sm">28%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-body">C</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-border rounded">
                  <div className="w-1/4 h-full bg-button-primary rounded"></div>
                </div>
                <span className="text-heading text-sm">24%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <p className="text-body">
          Toggle between light and dark modes using the theme switch in the
          navigation bar above.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-border text-body hover:bg-button-hover"
          >
            Light Mode Elements
          </Button>
          <Button className="bg-button-primary text-button-primary-text hover:bg-maroon-light">
            Dark Mode Elements
          </Button>
        </div>
      </div>
    </div>
  );
}
