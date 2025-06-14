import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - richen.sh",
  description: "Get in touch with me for collaborations, opportunities, or just to chat about technology",
  keywords: ["contact", "email", "collaboration", "software developer"],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 