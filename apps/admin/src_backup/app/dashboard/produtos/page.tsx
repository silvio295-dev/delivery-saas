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

type Produto = {
  id: string;
  nome: string;
  preco: number;
  createdAt?: any;
};

export default function ProdutosPage() {
  const tenantId = "empresa"; // por enquanto fixo
  const colRef = useMemo(() => collection(db, "tenants", tenantId, "products"), [tenantId]);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
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
          const lista: Produto[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              nome: data.nome ?? "",
              preco: Number(data.preco ?? 0),
              createdAt: data.createdAt,
            };
          });
          setProdutos(lista);
        },
        (err: any) => {
          console.error(err);
          alert("Erro ao listar produtos: " + (err?.code ?? "desconhecido"));
        }
      );
    });

    return () => {
      if (unsubSnap) unsubSnap();
      unsubAuth();
    };
  }, [colRef]);

  async function salvarProduto() {
    const nomeTrim = nome.trim();
    const precoNum = Number(preco);

    if (!nomeTrim) return alert("Informe o nome do produto.");
    if (Number.isNaN(precoNum) || precoNum <= 0) return alert("Preço inválido.");

    try {
      setLoading(true);

      await addDoc(colRef, {
        nome: nomeTrim,
        preco: precoNum,
        createdAt: serverTimestamp(),
      });

      setNome("");
      setPreco("");
    } catch (e: any) {
      console.error(e);
      alert("Erro ao cadastrar: " + (e?.code ?? e?.message ?? "desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function excluirProduto(id: string) {
    if (!confirm("Excluir este produto?")) return;

    try {
      await deleteDoc(doc(db, "tenants", tenantId, "products", id));
    } catch (e: any) {
      console.error(e);
      alert("Erro ao excluir: " + (e?.code ?? e?.message ?? "desconhecido"));
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Cadastro de Produtos</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <input
          id="nome-produto"
          name="nomeProduto"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 260 }}
        />
        <input
          id="preco-produto"
          name="precoProduto"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, width: 140 }}
        />
        <button
          onClick={salvarProduto}
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

      <h2 style={{ marginTop: 24 }}>Produtos</h2>

      {produtos.length === 0 ? (
        <p>Nenhum produto ainda.</p>
      ) : (
        <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
          {produtos.map((p) => (
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
              <span style={{ width: 260 }}>{p.nome}</span>
              <span style={{ width: 120 }}>R$ {p.preco.toFixed(2)}</span>
              <button
                onClick={() => excluirProduto(p.id)}
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