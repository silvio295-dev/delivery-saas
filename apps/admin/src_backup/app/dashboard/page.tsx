"use client";

import Link from "next/link";

export default function DashboardHome() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 10 }}>
        Painel Administrativo
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <Link
          href="/dashboard/produtos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "#111",
          }}
        >
          🛍️ <b>Produtos</b>
        </Link>

        <Link
          href="/dashboard/pedidos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "#111",
          }}
        >
          📦 <b>Pedidos</b>
        </Link>

        <Link
          href="/dashboard/clientes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            color: "#111",
          }}
        >
          👥 <b>Clientes</b>
        </Link>
      </div>
    </div>
  );
}