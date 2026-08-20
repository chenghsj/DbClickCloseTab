import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

describe("balanced compact shadcn style", () => {
  it("uses readable compact controls by default", () => {
    render(
      <>
        <Button>Action</Button>
        <Input aria-label="Value" />
        <Select value="auto">
          <SelectTrigger aria-label="Theme">
            <SelectValue>Automatic</SelectValue>
          </SelectTrigger>
        </Select>
        <Switch aria-label="Enabled" />
        <Badge>Status</Badge>
      </>,
    );

    expect(screen.getByRole("button", { name: "Action" })).toHaveClass(
      "h-8",
      "rounded-lg",
    );
    expect(screen.getByRole("textbox", { name: "Value" })).toHaveClass(
      "h-8",
      "rounded-lg",
    );
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveClass(
      "h-8",
      "rounded-lg",
    );
    expect(screen.getByRole("switch", { name: "Enabled" })).toHaveClass(
      "data-[size=default]:h-[18.4px]",
      "data-[size=default]:w-8",
    );
    expect(screen.getByText("Status")).toHaveClass("h-5", "px-2");
  });

  it("uses compact card spacing", () => {
    const { container } = render(
      <Card size="sm">
        <CardContent>Settings</CardContent>
      </Card>,
    );

    expect(container.querySelector('[data-slot="card"]')).toHaveClass(
      "rounded-xl",
      "data-[size=sm]:gap-3",
      "data-[size=sm]:py-3",
    );
    expect(container.querySelector('[data-slot="card-content"]')).toHaveClass(
      "px-4",
      "group-data-[size=sm]/card:px-3",
    );
  });
});
