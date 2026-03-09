"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuthMembership } from "@/lib/authHooks";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, user, tenantId, role } = useAuthMembership();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  async function sair() {
    await signOut(auth);
    router.replace("/");
  }

  const nav = [
    { href: "/dashboard/produtos", label: "📦 Produtos" },
    { href: "/dashboard/pedidos", label: "📦 Pedidos" },
    { href: "/dashboard/clientes", label: "👥 Clientes" },
    { href: "/dashboard/ingredientes", label: "🥓 Ingredientes" },
  ];

  if (loading) {
    return <div style={{ padding: 24 }}>Carregando autenticação...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 14 }}>
        Tenant: {tenantId ?? "-"} • Role: {role ?? "-"} • Rota: {pathname}
      </div>

      <h1 style={{ fontSize: 54, margin: "10px 0 16px" }}>Painel Administrativo</h1>

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #e5e5e5",
                textDecoration: "none",
                color: "#111",
                background: active ? "#f3f3f3" : "#fff",
                fontWeight: active ? 700 : 500,
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        <button
          onClick={sair}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#fff",
          }}
        >
          Sair
        </button>
      </div>

      <div style={{ borderTop: "1px solid #eee", paddingTop: 18 }}>{children}</div>
    </div>
  );
}