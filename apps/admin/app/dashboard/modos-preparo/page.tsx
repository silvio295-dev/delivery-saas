"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseClient";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ModosPreparoPage() {
  const [modos, setModos] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);

  async function loadTenant() {
    const user = auth.currentUser;
    if (!user) return;

    const membershipRef = doc(db, "memberships", user.uid);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) return;

    const data: any = membershipSnap.data();
    setTenantId(data.tenantId);

    await loadModos(data.tenantId);
  }

  async function loadModos(tid: string) {
    const ref = collection(db, "tenants", tid, "preparation_modes");
    const snap = await getDocs(ref);

    const lista: any[] = [];
    snap.forEach((item) => {
      lista.push({
        id: item.id,
        ...item.data(),
      });
    });

    setModos(lista);
  }

  async function createModo() {
    if (!tenantId) return;
    if (!name.trim()) return;

    const ref = collection(db, "tenants", tenantId, "preparation_modes");

    await addDoc(ref, {
      name: name.trim(),
      active: true,
      created_at: serverTimestamp(),
    });

    setName("");
    await loadModos(tenantId);
  }

  async function removeModo(id: string) {
    if (!tenantId) return;

    const ref = doc(db, "tenants", tenantId, "preparation_modes", id);
    await deleteDoc(ref);

    await loadModos(tenantId);
  }

  useEffect(() => {
    loadTenant();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Modos de Preparo</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nome do modo de preparo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={createModo}>Adicionar</button>
      </div>

      <ul>
        {modos.map((modo) => (
          <li key={modo.id} style={{ marginBottom: 10 }}>
            {modo.name}
            <button
              onClick={() => removeModo(modo.id)}
              style={{ marginLeft: 10 }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}