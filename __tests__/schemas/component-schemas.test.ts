import { describe, it, expect } from "vitest";
import {
  HeroBannerSchema,
  ProductCardSchema,
  PromoBannerSchema,
  NoticeBoxSchema,
  FeatureListSchema,
  InputFieldSchema,
  CTAButtonGroupSchema,
  ModalPreviewSchema,
} from "@/lib/schemas";
import { PricingTableSchema } from "@/lib/schemas/pricing-table";
import { TestimonialSchema } from "@/lib/schemas/testimonial";
import { StatsRowSchema } from "@/lib/schemas/stats-row";
import { NavBarSchema } from "@/lib/schemas/nav-bar";
import { FooterSchema } from "@/lib/schemas/footer";
import { AvatarGroupSchema } from "@/lib/schemas/avatar-group";

describe("HeroBannerSchema", () => {
  it("accepts valid props", () => {
    const result = HeroBannerSchema.safeParse({
      title: "Welcome",
      subtitle: "Hello world",
      cta: { label: "Click", href: "/go" },
      align: "center",
    });
    expect(result.success).toBe(true);
  });

  it("requires title", () => {
    const result = HeroBannerSchema.safeParse({ subtitle: "No title" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = HeroBannerSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects javascript: href", () => {
    const result = HeroBannerSchema.safeParse({
      title: "Test",
      cta: { label: "Click", href: "javascript:alert(1)" },
    });
    expect(result.success).toBe(false);
  });

  it("defaults align to left", () => {
    const result = HeroBannerSchema.parse({ title: "Test" });
    expect(result.align).toBe("left");
  });
});

describe("ProductCardSchema", () => {
  it("accepts valid props", () => {
    const result = ProductCardSchema.safeParse({
      title: "Premium",
      description: "Great plan",
      badge: "New",
      action: { label: "Buy", href: "/buy" },
    });
    expect(result.success).toBe(true);
  });

  it("requires title", () => {
    const result = ProductCardSchema.safeParse({ description: "No title" });
    expect(result.success).toBe(false);
  });
});

describe("PromoBannerSchema", () => {
  it("accepts valid props", () => {
    const result = PromoBannerSchema.safeParse({
      title: "Sale",
      description: "50% off",
      href: "/sale",
      variant: "info",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid variant", () => {
    const result = PromoBannerSchema.safeParse({
      title: "Sale",
      variant: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("NoticeBoxSchema", () => {
  it("accepts valid props", () => {
    const result = NoticeBoxSchema.safeParse({
      title: "Success",
      message: "It worked",
      type: "success",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = NoticeBoxSchema.safeParse({
      title: "Test",
      message: "Msg",
      type: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("FeatureListSchema", () => {
  it("accepts valid props", () => {
    const result = FeatureListSchema.safeParse({
      features: [{ title: "Fast", description: "Very fast" }],
      columns: "2",
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one feature", () => {
    const result = FeatureListSchema.safeParse({ features: [] });
    expect(result.success).toBe(false);
  });
});

describe("InputFieldSchema", () => {
  it("accepts valid props", () => {
    const result = InputFieldSchema.safeParse({
      label: "Email",
      placeholder: "you@example.com",
      type: "email",
    });
    expect(result.success).toBe(true);
  });
});

describe("CTAButtonGroupSchema", () => {
  it("accepts valid props", () => {
    const result = CTAButtonGroupSchema.safeParse({
      alignment: "center",
      buttons: [{ label: "Go", href: "/go", variant: "primary" }],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one button", () => {
    const result = CTAButtonGroupSchema.safeParse({
      alignment: "left",
      buttons: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("ModalPreviewSchema", () => {
  it("accepts valid props", () => {
    const result = ModalPreviewSchema.safeParse({
      title: "Confirm",
      body: "Are you sure?",
      open: true,
      size: "md",
      actions: [{ label: "OK", variant: "primary" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("PricingTableSchema", () => {
  it("accepts valid props", () => {
    const result = PricingTableSchema.safeParse({
      heading: "Plans",
      tiers: [
        {
          name: "Basic",
          price: "$9",
          period: "mo",
          features: ["Feature 1"],
          cta: { label: "Start", href: "/start" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty tiers", () => {
    const result = PricingTableSchema.safeParse({ tiers: [] });
    expect(result.success).toBe(false);
  });

  it("rejects tier with empty features", () => {
    const result = PricingTableSchema.safeParse({
      tiers: [
        {
          name: "Basic",
          price: "$9",
          features: [],
          cta: { label: "Start", href: "/start" },
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("TestimonialSchema", () => {
  it("accepts valid props", () => {
    const result = TestimonialSchema.safeParse({
      quote: "Great product",
      author: "Jane",
      role: "CTO",
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating out of range", () => {
    expect(TestimonialSchema.safeParse({ quote: "Good", author: "A", rating: 0 }).success).toBe(
      false,
    );
    expect(TestimonialSchema.safeParse({ quote: "Good", author: "A", rating: 6 }).success).toBe(
      false,
    );
  });
});

describe("StatsRowSchema", () => {
  it("accepts valid props", () => {
    const result = StatsRowSchema.safeParse({
      stats: [{ value: "100", label: "Users" }],
      columns: "2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid column value", () => {
    const result = StatsRowSchema.safeParse({
      stats: [{ value: "100", label: "Users" }],
      columns: "5",
    });
    expect(result.success).toBe(false);
  });
});

describe("NavBarSchema", () => {
  it("accepts valid props", () => {
    const result = NavBarSchema.safeParse({
      logo: { text: "Acme" },
      links: [{ label: "Home", href: "/" }],
      cta: { label: "Sign up", href: "/signup" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects javascript: in links", () => {
    const result = NavBarSchema.safeParse({
      links: [{ label: "Evil", href: "javascript:void(0)" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("FooterSchema", () => {
  it("accepts valid props", () => {
    const result = FooterSchema.safeParse({
      columns: [
        {
          heading: "Product",
          links: [{ label: "Features", href: "/features" }],
        },
      ],
      bottomText: "© 2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty columns", () => {
    const result = FooterSchema.safeParse({ columns: [] });
    expect(result.success).toBe(false);
  });
});

describe("AvatarGroupSchema", () => {
  it("accepts valid props", () => {
    const result = AvatarGroupSchema.safeParse({
      avatars: [{ imageUrl: "https://example.com/a.jpg", name: "Alice" }],
      maxVisible: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid imageUrl", () => {
    const result = AvatarGroupSchema.safeParse({
      avatars: [{ imageUrl: "not-a-url", name: "Alice" }],
    });
    expect(result.success).toBe(false);
  });
});
