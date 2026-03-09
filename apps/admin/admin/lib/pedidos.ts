import { db } from "./firebaseClient";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";

export type PedidoItem = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
};

export type CriarPedidoInput = {
  tenantId: string;
  clienteId: string;
  clienteNome: string;
  items: PedidoItem[];
};

export async function criarPedido(data: CriarPedidoInput) {
  const total = data.items.reduce((acc, item) => acc + item.subtotal, 0);

  const pedido = {
    tenantId: data.tenantId,
    clienteId: data.clienteId,
    clienteNome: data.clienteNome,
    status: "novo",
    total,
    items: data.items,
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, "pedidos"), pedido);

  return ref.id;
}

export async function atualizarStatusPedido(
  pedidoId: string,
  status: string
) {
  const ref = doc(db, "pedidos", pedidoId);

  await updateDoc(ref, {
    status
  });
}
