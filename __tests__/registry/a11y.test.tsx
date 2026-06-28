import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { registry, getRegistryKeys } from "@/lib/registry";

expect.extend(toHaveNoViolations);

// jsdom can't compute layout, so color-contrast and a few layout-dependent
// rules are disabled; we assert the structural a11y rules (labels, names,
// roles, alt text) that the component sweep targeted.
const axeOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
    // Heading hierarchy is a page-level concern; components are rendered in
    // isolation here so a lone h2/h3 would wrongly trip this rule.
    "heading-order": { enabled: false },
  },
};

describe("Registry component accessibility", () => {
  const builtinKeys = getRegistryKeys().filter((key) => key in registry);

  for (const key of builtinKeys) {
    it(`${key} example has no axe violations`, async () => {
      const item = registry[key];
      const Component = item.component;
      const { container } = render(
        React.createElement(
          "div",
          { className: "sandy-preview" },
          React.createElement(Component, item.example.props),
        ),
      );
      const results = await axe(container, axeOptions);
      expect(results).toHaveNoViolations();
    });
  }
});
