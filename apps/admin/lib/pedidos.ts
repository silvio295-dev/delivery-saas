import { db } from "./firebaseClient";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

export type PedidoItem = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
};

export type Pedido = {
  id?: string;
  tenantId: string;
  clienteNome: string;
  status: string;
  items: PedidoItem[];
  total: number;
  createdAt?: any;
};

export async function criarPedido(pedido: Pedido) {
  const ref = collection(db, "pedidos");

  const data = {
    ...pedido,
    createdAt: serverTimestamp()
  };

  await addDoc(ref, data);
}

export async function listarPedidos(tenantId: string) {
  const ref = collection(db, "pedidos");

  const q = query(ref, where("tenantId", "==", tenantId));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
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

export function escutarPedidos(
  tenantId: string,
  callback: (pedidos: any[]) => void
) {
  const ref = collection(db, "pedidos");

  const q = query(ref, where("tenantId", "==", tenantId));

  return onSnapshot(q, (snap) => {
    const lista = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    callback(lista);
  });
}