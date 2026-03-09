"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Pedido = {
  id: string;
  status: string;
  total: number;
  createdAt?: any;
};

export default function PedidosPage() {
  const tenantId = "empresa"; // por enquanto fixo
  const colRef = useMemo(
    () => collection(db, "tenants", tenantId, "orders"),
    [tenantId]
  );

  const [status, setStatus] = useState("novo");
  const [total, setTotal] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubSnap: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // limpa snapshot anterior
      if (unsubSnap) {
        unsubSnap();
        unsubSnap = null;
      }

      if (!user) {
        window.location.href = "/";
        return;
      }

      const q = query(colRef, orderBy("createdAt", "desc"));

      unsubSnap = onSnapshot(
        q,
        (snap) => {
          const lista: Pedido[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              status: data.status ?? "novo",
              total: Number(data.total ?? 0),
              createdAt: data.createdAt,
            };
          });
          setPedidos(lista);
        },
        (err: any) => {
          console.error(err);
          alert("Erro ao listar pedidos: " + (err?.code ?? "desconhecido"));
        }
      );
    });

    return () => {
      if (unsubSnap) unsubSnap();
      unsubAuth();
    };
  }, [colRef]);

  async function salvarPedido() {
    const totalNum = Number(total);

    if (!status.trim()) return alert("Informe o status.");
    if (Number.isNaN(totalNum) || totalNum < 0) return alert("Total inválido.");

    try {
      setLoading(true);

      await addDoc(colRef, {
        status: status.trim(),
        total: totalNum,
        createdAt: serverTimestamp(),
      });

      setStatus("novo");
      setTotal("");
    } catch (e: any) {
      console.error(e);
      alert("Erro ao cadastrar: " + (e?.code ?? e?.message ?? "desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function excluirPedido(id: string) {
    if (!confirm("Excluir este pedido?")) return;

    try {
      await deleteDoc(doc(db, "tenants", tenantId, "orders", id));
    } catch (e: any) {
      console.error(e);
      alert("Erro ao excluir: " + (e?.code ?? e?.message ?? "desconhecido"));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Pedidos</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <input
          id="status-pedido"
          name="statusPedido"
          placeholder="Status (ex: novo)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 220 }}
        />
        <input
          id="total-pedido"
          name="totalPedido"
          placeholder="Total (ex: 49.90)"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 160 }}
        />
        <button
          onClick={salvarPedido}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "2px solid #111",
            background: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <h2 style={{ marginTop: 24 }}>Lista</h2>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido ainda.</p>
      ) : (
        <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
          {pedidos.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ width: 220 }}>{p.status}</span>
              <span style={{ width: 160 }}>R$ {p.total.toFixed(2)}</span>
              <button
                onClick={() => excluirPedido(p.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}