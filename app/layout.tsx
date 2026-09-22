import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { validLocale } from "@/lib/i18n";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { UserSync } from "@/components/UserSync";
const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export const metadata: Metadata = {
    title: "BesLiving - Co-living That Feels Like Home",
    description: "Find your perfect co-living space. Connect with like-minded people, move in seamlessly, and build community.",
};
export default async function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    const preferences = await cookies();
    const locale = validLocale(preferences.get("besliving-locale")?.value);
    const theme = preferences.get("besliving-theme")?.value === "dark" ? "dark" : "light";
    return <html lang={locale === "zh" ? "zh-Hans" : locale} className={theme === "dark" ? "dark" : ""} style={{ colorScheme: theme }}>
    <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
      <PreferencesProvider initialLocale={locale} initialTheme={theme}>
        <Header /><UserSync />{children}
      </PreferencesProvider>
    </body>
  </html>;
}
