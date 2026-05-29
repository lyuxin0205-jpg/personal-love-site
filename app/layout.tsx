import type { Metadata, Viewport } from "next";
import "./globals.css";
import { couple, siteText } from "@/data/site";
import { EditEntryButton } from "@/components/edit-entry-button";
import { ContentProvider } from "@/lib/content-store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteText.metadata.title,
  description: siteText.metadata.description,
  icons: {
    icon: "/images/site-icon.svg",
    apple: "/images/site-icon.svg"
  },
  openGraph: {
    title: siteText.metadata.title,
    description: siteText.metadata.openGraphDescription,
    images: [couple.backgroundImage]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f6eb",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <ContentProvider>
          {children}
          <EditEntryButton />
        </ContentProvider>
      </body>
    </html>
  );
}
