"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { atualizarStatusPedido } from "../../../lib/pedidos";

type PedidoItem = {
  nome: string;
  quantidade: number;
};

type Pedido = {
  id: string;
  clienteNome: string;
  status: string;
  items: PedidoItem[];
};

export default function CozinhaPage() {
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

  async function mudarStatus(id: string, status: string) {
    await atualizarStatusPedido(id, status);
    carregarPedidos();
  }

  const novos = pedidos.filter((p) => p.status === "novo");
  const preparando = pedidos.filter((p) => p.status === "preparando");
  const entrega = pedidos.filter((p) => p.status === "saiu_entrega");

  return (
    <div style={{ padding: 20 }}>
      <h1>Painel de Cozinha</h1>

      <div
        style={{
          display: "flex",
          gap: 20
        }}
      >
        <Coluna
          titulo="NOVOS"
          pedidos={novos}
          acao={(id: string) => mudarStatus(id, "preparando")}
          botao="Preparar"
        />

        <Coluna
          titulo="PREPARANDO"
          pedidos={preparando}
          acao={(id: string) => mudarStatus(id, "saiu_entrega")}
          botao="Saiu Entrega"
        />

        <Coluna
          titulo="ENTREGA"
          pedidos={entrega}
          acao={(id: string) => mudarStatus(id, "finalizado")}
          botao="Finalizar"
        />
      </div>
    </div>
  );
}

function Coluna({
  titulo,
  pedidos,
  acao,
  botao
}: any) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f4f4f4",
        padding: 15
      }}
    >
      <h2>{titulo}</h2>

      {pedidos.map((pedido: any) => (
        <div
          key={pedido.id}
          style={{
            background: "white",
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ddd"
          }}
        >
          <strong>{pedido.clienteNome}</strong>

          <ul>
            {pedido.items?.map((item: any, i: number) => (
              <li key={i}>
                {item.nome} x {item.quantidade}
              </li>
            ))}
          </ul>

          <button onClick={() => acao(pedido.id)}>
            {botao}
          </button>
        </div>
      ))}
    </div>
  );
}