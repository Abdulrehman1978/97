import type { Metadata } from "next";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/AuthProviderWrapper";

export const metadata: Metadata = {
  title: "LUNA / LIP • PM-AJAY Livelihood Intelligence Platform | SIH26097",
  description: "AI-Driven Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling Recommendations under PM-AJAY GIA.",
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: "#001428",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#001428" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface">
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[LIP PWA] ServiceWorker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('[LIP PWA] ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
