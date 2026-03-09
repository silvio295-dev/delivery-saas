"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function PedidosPage() {

  const [pedidos, setPedidos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {

    const ref = collection(db, "pedidos");

    const unsub = onSnapshot(ref, (snapshot) => {

      const lista: any[] = [];

      snapshot.forEach((docItem) => {
        lista.push({
          id: docItem.id,
          ...docItem.data(),
        });
      });

      setPedidos(lista);

    });

    return () => unsub();

  }, []);

  async function atualizarStatus(id: string, status: string) {

    const ref = doc(db, "pedidos", id);

    await updateDoc(ref, {
      status: status,
    });

  }

  async function sair() {

    await signOut(auth);

    router.push("/login");

  }

  return (

    <div style={{ padding: 40 }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        <h1>Pedidos</h1>

        <div style={{ display: "flex", gap: 10 }}>

          <button onClick={() => router.push("/dashboard/novo-pedido")}>
            Novo Pedido
          </button>

          <button onClick={sair}>
            Sair
          </button>

        </div>

      </div>

      {pedidos.map((pedido) => (

        <div
          key={pedido.id}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            marginBottom: 20
          }}
        >

          <h3>{pedido.clienteNome}</h3>

          <p>Status: {pedido.status}</p>

          <p>Total: R$ {pedido.total}</p>

          <strong>Itens</strong>

          {pedido.items?.map((item: any, index: number) => (
            <div key={index}>
              {item.nome} x{item.quantidade}
            </div>
          ))}

          <div style={{ marginTop: 10 }}>

            <button onClick={() => atualizarStatus(pedido.id, "novo")}>
              Novo
            </button>

            <button onClick={() => atualizarStatus(pedido.id, "preparando")}>
              Preparando
            </button>

            <button onClick={() => atualizarStatus(pedido.id, "entrega")}>
              Entrega
            </button>

          </div>

        </div>

      ))}

    </div>

  );
}