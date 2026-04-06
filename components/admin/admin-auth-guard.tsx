"use client";

import { useEffect, useState } from "react";

import { getAdminDemoAuth } from "@/lib/admin/demo-auth";

export function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentAuth = getAdminDemoAuth();

    setAuthenticated(currentAuth);
    setReady(true);

    if (!currentAuth) {
      window.location.replace("/admin/login");
    }
  }, []);

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        正在跳转...
      </div>
    );
  }

  return <>{children}</>;
}
