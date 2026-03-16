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
import { Testimonial } from "@/components/registry/testimonial";
import { StatsRow } from "@/components/registry/stats-row";
import { NavBar } from "@/components/registry/nav-bar";
import { Footer } from "@/components/registry/footer";
import { AvatarGroup } from "@/components/registry/avatar-group";
import { AccountHeader } from "@/components/registry/account-header";
import { BalanceCard } from "@/components/registry/balance-card";
import { QuickActions } from "@/components/registry/quick-actions";
import { InfoCardGrid } from "@/components/registry/info-card-grid";
import { TransactionList } from "@/components/registry/transaction-list";
import { BottomTabBar } from "@/components/registry/bottom-tab-bar";
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
  TestimonialSchema,
  StatsRowSchema,
  NavBarSchema,
  FooterSchema,
  AvatarGroupSchema,
  AccountHeaderSchema,
  BalanceCardSchema,
  QuickActionsSchema,
  InfoCardGridSchema,
  TransactionListSchema,
  BottomTabBarSchema,
} from "@/lib/schemas";

function section(id: string, component: string, props: Record<string, unknown>): Section {
  return { id, component, props };
}

export function defaultPage(sectionOverride?: Section): Page {
  if (sectionOverride) {
    return {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [sectionOverride],
    };
  }
  return {
    version: "2.0",
    theme: { brand: "default", mode: "light" },
    meta: { viewport: "mobile" },
    sections: [
      { id: "sec_1", component: "AccountHeader", props: { greeting: "Olá", userName: "Daniel", actions: [{ icon: "eye-off", label: "Hide balance" }, { icon: "help-circle", label: "Help" }] } },
      { id: "sec_2", component: "BalanceCard", props: { label: "Saldo", amount: "R$ 4,521.89", visible: false, action: { label: "See statement", href: "/statement" } } },
      { id: "sec_3", component: "QuickActions", props: { actions: [{ icon: "camera", label: "Scan", href: "/scan" }, { icon: "arrow-up-right", label: "Send Pix", href: "/send", badge: "12x" }, { icon: "barcode", label: "Pay", href: "/pay" }, { icon: "phone", label: "Top up", href: "/topup" }] } },
      { id: "sec_4", component: "InfoCardGrid", props: { cards: [{ title: "Credit card", value: "R$ 2,500.00", footnote: "Available limit", action: { label: "Details", href: "/card" } }, { title: "Invoice", value: "R$ 189.50", footnote: "Due Apr 06", action: { label: "Pay now", href: "/invoice" } }, { title: "Loans", description: "Best rates available", action: { label: "Simulate", href: "/loans" } }, { title: "Investments", value: "R$ 12,350.00", footnote: "Total invested", action: { label: "Simulate", href: "/invest" } }] } },
      { id: "sec_5", component: "TransactionList", props: { heading: "Recent activity", transactions: [{ title: "Coffee Shop", subtitle: "Debit card", amount: "- R$ 12.50", timestamp: "Today", type: "payment" }, { title: "Salary deposit", subtitle: "TED received", amount: "+ R$ 5,200.00", timestamp: "Yesterday", type: "received" }, { title: "Transfer to Ana", subtitle: "Pix", amount: "- R$ 150.00", timestamp: "Mar 9", type: "sent" }], showAllLabel: "View all transactions", showAllHref: "/transactions" } },
      { id: "sec_6", component: "BottomTabBar", props: { tabs: [{ icon: "home", label: "Home", href: "/home", active: true }, { icon: "card", label: "Cards", href: "/cards" }, { icon: "diamond", label: "Pix", href: "/pix" }, { icon: "chart", label: "Invest", href: "/invest" }, { icon: "grid", label: "Products", href: "/products" }] } },
    ],
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
  Testimonial: {
    component: Testimonial as RegistryItem["component"],
    schema: TestimonialSchema,
    example: section("sec_1", "Testimonial", {
      quote: "This product completely transformed how our team collaborates. The results speak for themselves.",
      author: "Sarah Chen",
      role: "VP of Engineering, Acme Corp",
      rating: 5,
    }),
    metadata: { name: "Testimonial", description: "Customer quote with author, role, avatar, and star rating", supportsTheme: true },
  },
  StatsRow: {
    component: StatsRow as RegistryItem["component"],
    schema: StatsRowSchema,
    example: section("sec_1", "StatsRow", {
      columns: "3",
      stats: [
        { value: "10K+", label: "Active users", description: "Across 40 countries" },
        { value: "99.9%", label: "Uptime", description: "Over the last 12 months" },
        { value: "4.8/5", label: "Rating", description: "From 2,000+ reviews" },
      ],
    }),
    metadata: { name: "Stats Row", description: "Grid of key metrics with values and labels", supportsTheme: true },
  },
  NavBar: {
    component: NavBar as RegistryItem["component"],
    schema: NavBarSchema,
    example: section("sec_1", "NavBar", {
      logo: { text: "Acme" },
      links: [
        { label: "Products", href: "/products" },
        { label: "Pricing", href: "/pricing" },
        { label: "Docs", href: "/docs" },
        { label: "Blog", href: "/blog" },
      ],
      cta: { label: "Sign up", href: "/signup" },
    }),
    metadata: { name: "Nav Bar", description: "Navigation bar with logo, links, and optional CTA", supportsTheme: true },
  },
  Footer: {
    component: Footer as RegistryItem["component"],
    schema: FooterSchema,
    example: section("sec_1", "Footer", {
      columns: [
        {
          heading: "Product",
          links: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Changelog", href: "/changelog" },
          ],
        },
        {
          heading: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Careers", href: "/careers" },
          ],
        },
        {
          heading: "Support",
          links: [
            { label: "Help Center", href: "/help" },
            { label: "Contact", href: "/contact" },
            { label: "Status", href: "/status" },
          ],
        },
      ],
      bottomText: "\u00a9 2026 Acme Inc. All rights reserved.",
    }),
    metadata: { name: "Footer", description: "Multi-column footer with links and bottom text", supportsTheme: true },
  },
  AvatarGroup: {
    component: AvatarGroup as RegistryItem["component"],
    schema: AvatarGroupSchema,
    example: section("sec_1", "AvatarGroup", {
      avatars: [
        { imageUrl: "https://i.pravatar.cc/80?u=1", name: "Alice" },
        { imageUrl: "https://i.pravatar.cc/80?u=2", name: "Bob" },
        { imageUrl: "https://i.pravatar.cc/80?u=3", name: "Carol" },
        { imageUrl: "https://i.pravatar.cc/80?u=4", name: "Dave" },
        { imageUrl: "https://i.pravatar.cc/80?u=5", name: "Eve" },
      ],
      maxVisible: 3,
      label: "5 team members",
    }),
    metadata: { name: "Avatar Group", description: "Overlapping avatar stack with overflow count", supportsTheme: true },
  },
  AccountHeader: {
    component: AccountHeader as RegistryItem["component"],
    schema: AccountHeaderSchema,
    example: section("sec_1", "AccountHeader", {
      greeting: "Good morning",
      userName: "Maria",
      avatarUrl: "https://i.pravatar.cc/80?u=maria",
      actions: [
        { icon: "eye-off", label: "Hide balance" },
        { icon: "help-circle", label: "Help" },
      ],
    }),
    metadata: { name: "Account Header", description: "User greeting bar with avatar and action icons", supportsTheme: true },
  },
  BalanceCard: {
    component: BalanceCard as RegistryItem["component"],
    schema: BalanceCardSchema,
    example: section("sec_1", "BalanceCard", {
      label: "Available balance",
      amount: "R$ 4,521.89",
      visible: true,
      footnote: "Updated just now",
      action: { label: "See statement", href: "/statement" },
    }),
    metadata: { name: "Balance Card", description: "Account balance display with optional masking and CTA", supportsTheme: true },
  },
  QuickActions: {
    component: QuickActions as RegistryItem["component"],
    schema: QuickActionsSchema,
    example: section("sec_1", "QuickActions", {
      actions: [
        { icon: "camera", label: "Scan", href: "/scan" },
        { icon: "arrow-up-right", label: "Send Pix", href: "/send", badge: "12x" },
        { icon: "barcode", label: "Pay", href: "/pay" },
        { icon: "phone", label: "Top up", href: "/topup" },
      ],
    }),
    metadata: { name: "Quick Actions", description: "Horizontal row of icon action buttons with labels", supportsTheme: true },
  },
  InfoCardGrid: {
    component: InfoCardGrid as RegistryItem["component"],
    schema: InfoCardGridSchema,
    example: section("sec_1", "InfoCardGrid", {
      cards: [
        { title: "Credit card", value: "R$ 2,500.00", footnote: "Available limit", action: { label: "Details", href: "/card" } },
        { title: "Invoice", value: "R$ 189.50", footnote: "Due Mar 15", action: { label: "Pay now", href: "/invoice" } },
        { title: "Loans", description: "Pre-approved offer", action: { label: "Check rates", href: "/loans" } },
        { title: "Insurance", description: "Protect what matters", action: { label: "Learn more", href: "/insurance" } },
      ],
    }),
    metadata: { name: "Info Card Grid", description: "Two-column grid of summary cards with optional values and actions", supportsTheme: true },
  },
  TransactionList: {
    component: TransactionList as RegistryItem["component"],
    schema: TransactionListSchema,
    example: section("sec_1", "TransactionList", {
      heading: "Recent activity",
      transactions: [
        { title: "Coffee Shop", subtitle: "Debit card", amount: "- R$ 12.50", timestamp: "Today", type: "payment" },
        { title: "Salary deposit", subtitle: "TED received", amount: "+ R$ 5,200.00", timestamp: "Mar 10", type: "received" },
        { title: "Transfer to Ana", subtitle: "Pix", amount: "- R$ 150.00", timestamp: "Mar 9", type: "sent" },
        { title: "Investment fund", subtitle: "CDB 120%", amount: "- R$ 500.00", timestamp: "Mar 8", type: "investment" },
      ],
      showAllLabel: "View all transactions",
      showAllHref: "/transactions",
    }),
    metadata: { name: "Transaction List", description: "List of transactions with icons, amounts, and timestamps", supportsTheme: true },
  },
  BottomTabBar: {
    component: BottomTabBar as RegistryItem["component"],
    schema: BottomTabBarSchema,
    example: section("sec_1", "BottomTabBar", {
      tabs: [
        { icon: "home", label: "Home", href: "/home", active: true },
        { icon: "card", label: "Cards", href: "/cards" },
        { icon: "diamond", label: "Pix", href: "/pix" },
        { icon: "chart", label: "Invest", href: "/invest" },
        { icon: "grid", label: "Products", href: "/products" },
      ],
    }),
    metadata: { name: "Bottom Tab Bar", description: "Bottom navigation bar with icon tabs", supportsTheme: true },
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
