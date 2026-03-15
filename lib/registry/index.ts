import type { RegistryItem, Section, Page } from "./types";
import { HeroBanner } from "@/components/registry/hero-banner";
import { ProductCard } from "@/components/registry/product-card";
import { PromoBanner } from "@/components/registry/promo-banner";
import { NoticeBox } from "@/components/registry/notice-box";
import { FeatureList } from "@/components/registry/feature-list";
import { InputField } from "@/components/registry/input-field";
import { CTAButtonGroup } from "@/components/registry/cta-button-group";
import { ModalPreview } from "@/components/registry/modal-preview";
import { PricingTable } from "@/components/registry/pricing-table";
import {
  HeroBannerSchema,
  ProductCardSchema,
  PromoBannerSchema,
  NoticeBoxSchema,
  FeatureListSchema,
  InputFieldSchema,
  CTAButtonGroupSchema,
  ModalPreviewSchema,
  PricingTableSchema,
} from "@/lib/schemas";

function section(id: string, component: string, props: Record<string, unknown>): Section {
  return { id, component, props };
}

export function defaultPage(sectionOverride?: Section): Page {
  const sec = sectionOverride ?? registry.HeroBanner.example;
  return {
    version: "2.0",
    theme: { brand: "default", mode: "light" },
    meta: { viewport: "desktop" },
    sections: [sec],
  };
}

export const registry: Record<string, RegistryItem> = {
  HeroBanner: {
    component: HeroBanner as RegistryItem["component"],
    schema: HeroBannerSchema,
    example: section("sec_1", "HeroBanner", {
      title: "Welcome back",
      subtitle: "Your credit options in one place",
      cta: { label: "See offers", href: "/offers" },
      align: "left",
    }),
    metadata: { name: "Hero Banner", description: "Full-width hero section with title, subtitle, and CTA", supportsTheme: true },
  },
  ProductCard: {
    component: ProductCard as RegistryItem["component"],
    schema: ProductCardSchema,
    example: section("sec_1", "ProductCard", {
      title: "Premium Plan",
      description: "Unlock all features with our premium subscription.",
      badge: "Popular",
      action: { label: "Learn more", href: "/plans/premium" },
    }),
    metadata: { name: "Product Card", description: "Card with image, title, description, badge, and action", supportsTheme: true },
  },
  PromoBanner: {
    component: PromoBanner as RegistryItem["component"],
    schema: PromoBannerSchema,
    example: section("sec_1", "PromoBanner", {
      title: "Spring Sale — 20% off",
      description: "Use code SPRING20 at checkout. Ends March 31.",
      href: "/sale",
      variant: "info",
    }),
    metadata: { name: "Promo Banner", description: "Promotional banner with variant styling", supportsTheme: true },
  },
  NoticeBox: {
    component: NoticeBox as RegistryItem["component"],
    schema: NoticeBoxSchema,
    example: section("sec_1", "NoticeBox", {
      title: "Account verified",
      message: "Your email has been successfully verified. You can now access all features.",
      type: "success",
    }),
    metadata: { name: "Notice Box", description: "Alert/notice box with type-based styling", supportsTheme: true },
  },
  FeatureList: {
    component: FeatureList as RegistryItem["component"],
    schema: FeatureListSchema,
    example: section("sec_1", "FeatureList", {
      heading: "Why choose us",
      columns: "3",
      features: [
        { title: "Fast", description: "Lightning-fast performance out of the box.", icon: "⚡" },
        { title: "Secure", description: "Enterprise-grade security by default.", icon: "🔒" },
        { title: "Scalable", description: "Grows with your team and your traffic.", icon: "📈" },
      ],
    }),
    metadata: { name: "Feature List", description: "Grid of feature items with configurable columns", supportsTheme: true },
  },
  InputField: {
    component: InputField as RegistryItem["component"],
    schema: InputFieldSchema,
    example: section("sec_1", "InputField", {
      label: "Email address",
      placeholder: "you@example.com",
      type: "email",
      required: true,
      helperText: "We'll never share your email.",
    }),
    metadata: { name: "Input Field", description: "Form input with label, validation, and helper text", supportsTheme: true },
  },
  CTAButtonGroup: {
    component: CTAButtonGroup as RegistryItem["component"],
    schema: CTAButtonGroupSchema,
    example: section("sec_1", "CTAButtonGroup", {
      alignment: "left",
      buttons: [
        { label: "Get started", href: "/signup", variant: "primary" },
        { label: "Learn more", href: "/docs", variant: "outline" },
      ],
    }),
    metadata: { name: "CTA Button Group", description: "Row of action buttons with variant styling", supportsTheme: true },
  },
  ModalPreview: {
    component: ModalPreview as RegistryItem["component"],
    schema: ModalPreviewSchema,
    example: section("sec_1", "ModalPreview", {
      title: "Confirm your action",
      body: "Are you sure you want to proceed? This action cannot be undone.",
      open: true,
      size: "md",
      actions: [
        { label: "Cancel", variant: "ghost" },
        { label: "Confirm", variant: "primary" },
      ],
    }),
    metadata: { name: "Modal Preview", description: "Modal dialog rendered inline for preview", supportsTheme: true },
  },
  PricingTable: {
    component: PricingTable as RegistryItem["component"],
    schema: PricingTableSchema,
    example: section("sec_1", "PricingTable", {
      heading: "Choose your plan",
      tiers: [
        {
          name: "Starter",
          price: "$9",
          period: "mo",
          features: ["5 projects", "10 GB storage", "Email support"],
          cta: { label: "Get started", href: "/signup?plan=starter" },
        },
        {
          name: "Pro",
          price: "$29",
          period: "mo",
          features: ["Unlimited projects", "100 GB storage", "Priority support", "API access"],
          cta: { label: "Go Pro", href: "/signup?plan=pro" },
          highlighted: true,
        },
        {
          name: "Enterprise",
          price: "$99",
          period: "mo",
          features: ["Unlimited everything", "Dedicated support", "SSO & SAML", "Custom integrations"],
          cta: { label: "Contact sales", href: "/contact" },
        },
      ],
    }),
    metadata: { name: "Pricing Table", description: "Tiered pricing comparison with highlighted plan", supportsTheme: true },
  },
};

import { getCompositeItem, getCompositeKeys } from "./composite-registry";

const builtinKeys = Object.keys(registry);

export function getRegistryKeys(): string[] {
  return [...builtinKeys, ...getCompositeKeys()];
}

export function getRegistryItem(key: string): RegistryItem | undefined {
  return registry[key] ?? getCompositeItem(key);
}
