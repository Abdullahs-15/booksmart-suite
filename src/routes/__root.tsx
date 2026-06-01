import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="light-surface flex items-center justify-center px-4">
      <div className="max-w-md text-center glass-light-strong p-12">
        <h1 className="text-7xl font-bold text-ink">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">Page not found</h2>
        <p className="mt-2 text-sm text-ink-mid">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-2.5 text-sm font-medium text-white hover:bg-black transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="light-surface flex items-center justify-center px-4">
      <div className="max-w-md text-center glass-light-strong p-12">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-ink-mid">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-2.5 text-sm font-medium text-white hover:bg-black transition-all"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white border border-black/10 px-6 py-2.5 text-sm font-medium text-ink hover:bg-black/5 transition-all"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BookSmart" },
      { name: "description", content: "Online booking for modern service businesses." },
      { name: "author", content: "BookSmart" },
      { property: "og:title", content: "BookSmart" },
      { property: "og:description", content: "Online booking for modern service businesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@BookSmart" },
      { name: "twitter:title", content: "BookSmart" },
      { name: "twitter:description", content: "Online booking for modern service businesses." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dd62da56-8d4a-4d1b-9e6b-5edaaa0b9355/id-preview-ded64b58--58cc4a40-9246-4827-aacf-a9d0c36f65ec.lovable.app-1780335443863.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dd62da56-8d4a-4d1b-9e6b-5edaaa0b9355/id-preview-ded64b58--58cc4a40-9246-4827-aacf-a9d0c36f65ec.lovable.app-1780335443863.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
