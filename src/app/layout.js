import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import cx from "classnames";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Header from "../components/header";
import Footer from "../components/footer";
import ErrorFallback from "../components/errorFallback";

const GOOGLE_ANALYTICS_ID = process.env.GA4_ANALYTICS_ID;

const satoshi = localFont({
    src: "../../public/fonts/Satoshi-Variable.woff2",
    variable: "--font-satoshi",
    weight: "300 900",
    display: "swap",
    style: "normal"
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"]
});

export const metadata = {
    title: {
        default: "Compare Cars in India | Car Table",
        template: "%s | Car Table"
    },
    description:
        "Buying your first car in India? Car Table makes it easy! Compare shortlisted cars side-by-side with custom filters and charts. The ultimate DIY app for smart car buyers.",
    openGraph: {
        title: "Supercharge your car shortlisting with Car Table",
        description:
            "Buying your first car in India? Car Table makes it easy! Compare shortlisted cars side-by-side with custom filters and charts. The ultimate DIY app for smart car buyers.",
        url: "https://cartable.in",
        siteName: "Car Table",
        images: [
            {
                url: "https://cartable.in/og-image.png",
                width: 1920,
                height: 1080
            }
        ],
        locale: "en-US",
        type: "website"
    },
    metadataBase: new URL("https://cartable.in"),
    alternates: {
        canonical: "/"
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    twitter: {
        title: "Supercharge your car shortlisting with Car Table",
        card: "summary_large_image"
    },
    icons: {
        shortcut: "/favicon.ico"
    }
};
export default function RootLayout({ children }) {
    return (
        <html lang="en" className={cx(satoshi.variable, inter.variable, "min-h-screen bg-white")}>
            <body>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="ga4" strategy="afterInteractive">
                    {`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());

						gtag('config', '${GOOGLE_ANALYTICS_ID}');
					`}
                </Script>
                <div className="flex max-w-screen-2xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
                    <Header />
                    <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
                        <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
                    </main>
                    <Footer />
                </div>
                <div id="modal-root"></div>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{ duration: 2000 }}
                />
            </body>
            <Analytics />
        </html>
    );
}
