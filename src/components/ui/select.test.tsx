import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

describe("Select", () => {
  it("sizes the options panel to match the trigger width", () => {
    render(
      <Select open value="auto">
        <SelectTrigger aria-label="Theme" className="w-36">
          <SelectValue>Automatic</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Automatic</SelectItem>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(document.querySelector("[data-slot='select-content']")).toHaveClass(
      "w-(--radix-select-trigger-width)",
    );
  });
});
