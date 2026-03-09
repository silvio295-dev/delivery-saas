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

type Cliente = {
  id: string;
  nome: string;
  telefone?: string;
  createdAt?: any;
};

export default function ClientesPage() {
  const tenantId = "empresa"; // por enquanto fixo
  const colRef = useMemo(
    () => collection(db, "tenants", tenantId, "customers"),
    [tenantId]
  );

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
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
          const lista: Cliente[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              nome: data.nome ?? "",
              telefone: data.telefone ?? "",
              createdAt: data.createdAt,
            };
          });
          setClientes(lista);
        },
        (err: any) => {
          console.error(err);
          alert("Erro ao listar clientes: " + (err?.code ?? "desconhecido"));
        }
      );
    });

    return () => {
      if (unsubSnap) unsubSnap();
      unsubAuth();
    };
  }, [colRef]);

  async function salvarCliente() {
    const nomeTrim = nome.trim();
    const telTrim = telefone.trim();

    if (!nomeTrim) return alert("Informe o nome do cliente.");

    try {
      setLoading(true);

      await addDoc(colRef, {
        nome: nomeTrim,
        telefone: telTrim,
        createdAt: serverTimestamp(),
      });

      setNome("");
      setTelefone("");
    } catch (e: any) {
      console.error(e);
      alert("Erro ao cadastrar: " + (e?.code ?? e?.message ?? "desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente(id: string) {
    if (!confirm("Excluir este cliente?")) return;

    try {
      await deleteDoc(doc(db, "tenants", tenantId, "customers", id));
    } catch (e: any) {
      console.error(e);
      alert("Erro ao excluir: " + (e?.code ?? e?.message ?? "desconhecido"));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Clientes</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <input
          id="nome-cliente"
          name="nomeCliente"
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 260 }}
        />
        <input
          id="tel-cliente"
          name="telefoneCliente"
          placeholder="Telefone (opcional)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 220 }}
        />
        <button
          onClick={salvarCliente}
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

      {clientes.length === 0 ? (
        <p>Nenhum cliente ainda.</p>
      ) : (
        <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
          {clientes.map((c) => (
            <li
              key={c.id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ width: 260 }}>{c.nome}</span>
              <span style={{ width: 220 }}>{c.telefone || "-"}</span>
              <button
                onClick={() => excluirCliente(c.id)}
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