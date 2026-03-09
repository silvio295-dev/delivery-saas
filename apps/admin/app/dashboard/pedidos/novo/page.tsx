"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

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

          <p><strong>Cliente:</strong> {pedido.clienteNome}</p>

          <p><strong>Status:</strong> {pedido.status}</p>

          <p><strong>Total:</strong> R$ {pedido.total}</p>

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