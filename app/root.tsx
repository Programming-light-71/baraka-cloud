import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import React from "react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { ThemeProvider } from "./components/theme/theme-provider";
import { FileTransferProvider } from "./contexts/FileTransferContext";
import { FileTransferList } from "./components/drive/DOWNLOAD/FileTransferList";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    type: "image/x-icon",
    href: "/favicon.ico",
  },
  { rel: "icon", type: "image/svg+xml", href: "/logo-dark.svg" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {" "}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FileTransferProvider>
            {children}
            <FileTransferList />
          </FileTransferProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <React.Suspense fallback={<>Loading...</>}>
        <Outlet />
      </React.Suspense>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <pre>
          <code>{String(error)}</code>
        </pre>
        {/* add the UI you want your users to see */}
        <Scripts />
      </body>
    </html>
  );
}
