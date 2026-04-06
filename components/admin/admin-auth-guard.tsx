"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getAdminDemoAuth } from "@/lib/admin/demo-auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

export function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = useSyncExternalStore(
    subscribe,
    getAdminDemoAuth,
    (): boolean | null => null,
  );

  useEffect(() => {
    if (authenticated === false) {
      window.location.replace("/admin/login");
    }
  }, [authenticated]);

  if (authenticated !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        正在跳转...
      </div>
    );
  }

  return <>{children}</>;
}
