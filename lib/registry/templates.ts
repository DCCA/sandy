import type { Page } from "./types";

export type PageTemplate = {
  id: string;
  name: string;
  description: string;
  page: Page;
};

export const pageTemplates: PageTemplate[] = [
  {
    id: "product-landing",
    name: "Product Landing",
    description: "Hero, features, and call-to-action",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "HeroBanner",
          props: {
            title: "Build better products",
            subtitle: "The all-in-one platform for modern teams",
            cta: { label: "Get started", href: "/signup" },
            align: "center",
          },
        },
        {
          id: "sec_2",
          component: "FeatureList",
          props: {
            heading: "Why choose us",
            columns: "3",
            features: [
              { title: "Fast", description: "Lightning-fast performance out of the box.", icon: "⚡" },
              { title: "Secure", description: "Enterprise-grade security by default.", icon: "🔒" },
              { title: "Scalable", description: "Grows with your team and your traffic.", icon: "📈" },
            ],
          },
        },
        {
          id: "sec_3",
          component: "CTAButtonGroup",
          props: {
            alignment: "center",
            buttons: [
              { label: "Start free trial", href: "/signup", variant: "primary" },
              { label: "View pricing", href: "/pricing", variant: "outline" },
            ],
          },
        },
      ],
    },
  },
  {
    id: "notification-page",
    name: "Notification Page",
    description: "Notice, promo banner, and actions",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "NoticeBox",
          props: {
            title: "Account verified",
            message: "Your email has been successfully verified. You can now access all features.",
            type: "success",
          },
        },
        {
          id: "sec_2",
          component: "PromoBanner",
          props: {
            title: "Spring Sale — 20% off",
            description: "Use code SPRING20 at checkout. Ends March 31.",
            href: "/sale",
            variant: "info",
          },
        },
        {
          id: "sec_3",
          component: "CTAButtonGroup",
          props: {
            alignment: "left",
            buttons: [
              { label: "Browse deals", href: "/sale", variant: "primary" },
              { label: "Dismiss", href: "#", variant: "ghost" },
            ],
          },
        },
      ],
    },
  },
  {
    id: "signup-flow",
    name: "Sign Up Flow",
    description: "Hero, input field, and submit actions",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "HeroBanner",
          props: {
            title: "Join us today",
            subtitle: "Create your account in seconds",
            align: "center",
          },
        },
        {
          id: "sec_2",
          component: "InputField",
          props: {
            label: "Email address",
            placeholder: "you@example.com",
            type: "email",
            required: true,
            helperText: "We'll never share your email.",
          },
        },
        {
          id: "sec_3",
          component: "CTAButtonGroup",
          props: {
            alignment: "center",
            buttons: [
              { label: "Create account", href: "/signup", variant: "primary" },
              { label: "Sign in instead", href: "/login", variant: "outline" },
            ],
          },
        },
      ],
    },
  },
];
