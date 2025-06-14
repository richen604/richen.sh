import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - richen.sh",
  description: "Explore my software development projects and portfolio",
  keywords: ["projects", "portfolio", "software development", "web development"],
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 