import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | RARY CRM",
    default: "RARY CRM",
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}