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
              {
                title: "Fast",
                description: "Lightning-fast performance out of the box.",
                icon: "⚡",
              },
              { title: "Secure", description: "Enterprise-grade security by default.", icon: "🔒" },
              {
                title: "Scalable",
                description: "Grows with your team and your traffic.",
                icon: "📈",
              },
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
  {
    id: "banking-home",
    name: "Banking Home",
    description: "Mobile banking home screen with balance, actions, and transactions",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "AccountHeader",
          props: {
            greeting: "Olá",
            userName: "Daniel",
            actions: [
              { icon: "eye-off", label: "Hide balance" },
              { icon: "help-circle", label: "Help" },
            ],
          },
        },
        {
          id: "sec_2",
          component: "BalanceCard",
          props: {
            label: "Saldo",
            amount: "R$ 4,521.89",
            visible: false,
            action: { label: "See statement", href: "/statement" },
          },
        },
        {
          id: "sec_3",
          component: "QuickActions",
          props: {
            actions: [
              { icon: "camera", label: "Scan", href: "/scan" },
              { icon: "arrow-up-right", label: "Send Pix", href: "/send", badge: "12x" },
              { icon: "barcode", label: "Pay", href: "/pay" },
              { icon: "phone", label: "Top up", href: "/topup" },
            ],
          },
        },
        {
          id: "sec_4",
          component: "InfoCardGrid",
          props: {
            cards: [
              {
                title: "Credit card",
                value: "R$ 2,500.00",
                footnote: "Available limit",
                action: { label: "Details", href: "/card" },
              },
              {
                title: "Invoice",
                value: "R$ 189.50",
                footnote: "Due Apr 06",
                action: { label: "Pay now", href: "/invoice" },
              },
              {
                title: "Loans",
                description: "Best rates available",
                action: { label: "Simulate", href: "/loans" },
              },
              {
                title: "Investments",
                value: "R$ 12,350.00",
                footnote: "Total invested",
                action: { label: "Simulate", href: "/invest" },
              },
            ],
          },
        },
        {
          id: "sec_5",
          component: "TransactionList",
          props: {
            heading: "Recent activity",
            transactions: [
              {
                title: "Coffee Shop",
                subtitle: "Debit card",
                amount: "- R$ 12.50",
                timestamp: "Today",
                type: "payment",
              },
              {
                title: "Salary deposit",
                subtitle: "TED received",
                amount: "+ R$ 5,200.00",
                timestamp: "Yesterday",
                type: "received",
              },
              {
                title: "Transfer to Ana",
                subtitle: "Pix",
                amount: "- R$ 150.00",
                timestamp: "Mar 9",
                type: "sent",
              },
            ],
            showAllLabel: "View all transactions",
            showAllHref: "/transactions",
          },
        },
        {
          id: "sec_6",
          component: "BottomTabBar",
          props: {
            tabs: [
              { icon: "home", label: "Home", href: "/home", active: true },
              { icon: "card", label: "Cards", href: "/cards" },
              { icon: "diamond", label: "Pix", href: "/pix" },
              { icon: "chart", label: "Invest", href: "/invest" },
              { icon: "grid", label: "Products", href: "/products" },
            ],
          },
        },
      ],
    },
  },
  {
    id: "full-banner",
    name: "Full Banner",
    description: "Hero banner with features, testimonial, and CTA",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "HeroBanner",
          props: {
            title: "Your money, your way",
            subtitle: "Open your digital account in minutes. No fees, no paperwork.",
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
              { title: "No fees", description: "Zero monthly fees on your account.", icon: "💰" },
              {
                title: "Instant transfers",
                description: "Send and receive money in seconds.",
                icon: "⚡",
              },
              {
                title: "100% digital",
                description: "Open your account from your phone.",
                icon: "📱",
              },
            ],
          },
        },
        {
          id: "sec_3",
          component: "Testimonial",
          props: {
            quote:
              "I switched to this app and never looked back. Everything is so simple and fast.",
            author: "Maria Santos",
            role: "Customer since 2024",
            rating: 5,
          },
        },
        {
          id: "sec_4",
          component: "CTAButtonGroup",
          props: {
            alignment: "center",
            buttons: [
              { label: "Open account", href: "/signup", variant: "primary" },
              { label: "Learn more", href: "/about", variant: "outline" },
            ],
          },
        },
      ],
    },
  },
  {
    id: "bottom-sheet",
    name: "Bottom Sheet",
    description: "Payment confirmation bottom sheet over account view",
    page: {
      version: "2.0",
      theme: { brand: "default", mode: "light" },
      meta: { viewport: "mobile" },
      sections: [
        {
          id: "sec_1",
          component: "AccountHeader",
          props: {
            greeting: "Olá",
            userName: "Daniel",
            actions: [{ icon: "eye-off", label: "Hide" }],
          },
        },
        {
          id: "sec_2",
          component: "BalanceCard",
          props: {
            label: "Saldo",
            amount: "R$ 4,521.89",
            visible: false,
            action: { label: "Statement", href: "/statement" },
          },
        },
        {
          id: "sec_3",
          component: "BottomSheet",
          props: {
            title: "Confirm payment",
            subtitle: "Review the details below",
            items: [
              { label: "To", value: "Ana Silva" },
              { label: "Amount", value: "R$ 150.00" },
              { label: "Method", value: "Pix" },
              { label: "Date", value: "Today" },
            ],
            action: { label: "Pay now", href: "/pay" },
            secondaryAction: { label: "Cancel", href: "/cancel" },
          },
        },
      ],
    },
  },
];
