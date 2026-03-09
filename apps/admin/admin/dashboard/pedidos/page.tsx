"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { atualizarStatusPedido } from "@/lib/pedidos";

type PedidoItem = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
};

type Pedido = {
  id: string;
  clienteId: string;
  clienteNome: string;
  status: string;
  total: number;
  items: PedidoItem[];
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    const snap = await getDocs(collection(db, "pedidos"));

    const lista: Pedido[] = [];

    snap.forEach((doc) => {
      lista.push({
        id: doc.id,
        ...(doc.data() as any)
      });
    });

    setPedidos(lista);
  }

  async function mudarStatus(pedidoId: string, status: string) {
    await atualizarStatusPedido(pedidoId, status);
    carregarPedidos();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pedidos</h1>

      <Link href="/dashboard/pedidos/novo">
        Novo Pedido
      </Link>

      <hr />

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 15
          }}
        >
          <h3>Pedido {pedido.id}</h3>

          <p>
            <strong>Cliente:</strong> {pedido.clienteNome}
          </p>

          <p>
            <strong>Status:</strong> {pedido.status}
          </p>

          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => mudarStatus(pedido.id, "novo")}
            >
              Novo
            </button>

            <button
              onClick={() => mudarStatus(pedido.id, "preparando")}
              style={{ marginLeft: 5 }}
            >
              Preparando
            </button>

            <button
              onClick={() => mudarStatus(pedido.id, "saiu_entrega")}
              style={{ marginLeft: 5 }}
            >
              Saiu Entrega
            </button>

            <button
              onClick={() => mudarStatus(pedido.id, "finalizado")}
              style={{ marginLeft: 5 }}
            >
              Finalizado
            </button>
          </div>

          <p>
            <strong>Total:</strong> R$ {pedido.total}
          </p>

          <strong>Itens</strong>

          <ul>
            {pedido.items?.map((item, index) => (
              <li key={index}>
                {item.nome} — {item.quantidade} — R$ {item.subtotal}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}