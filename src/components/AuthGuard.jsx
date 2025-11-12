"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AuthGuard({
  children,
  requireAuth = false,
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
    }
  }, [
    user,
    loading,
    requireAuth,
    router,
  ]);

  if (loading)
    return (
      <p className="text-center mt-10">
        Cargando...
      </p>
    );

  return <>{children}</>;
}
