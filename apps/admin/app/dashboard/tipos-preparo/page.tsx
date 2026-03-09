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

export default function TiposPreparoPage() {
  const [tipos, setTipos] = useState<any[]>([]);
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

    await loadTipos(data.tenantId);
  }

  async function loadTipos(tid: string) {
    const ref = collection(db, "tenants", tid, "preparation_types");
    const snap = await getDocs(ref);

    const lista: any[] = [];
    snap.forEach((item) => {
      lista.push({
        id: item.id,
        ...item.data(),
      });
    });

    setTipos(lista);
  }

  async function createTipo() {
    if (!tenantId) return;
    if (!name.trim()) return;

    const ref = collection(db, "tenants", tenantId, "preparation_types");

    await addDoc(ref, {
      name: name.trim(),
      active: true,
      created_at: serverTimestamp(),
    });

    setName("");
    await loadTipos(tenantId);
  }

  async function removeTipo(id: string) {
    if (!tenantId) return;

    const ref = doc(db, "tenants", tenantId, "preparation_types", id);
    await deleteDoc(ref);

    await loadTipos(tenantId);
  }

  useEffect(() => {
    loadTenant();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Tipos de Preparo</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nome do tipo de preparo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={createTipo}>Adicionar</button>
      </div>

      <ul>
        {tipos.map((tipo) => (
          <li key={tipo.id} style={{ marginBottom: 10 }}>
            {tipo.name}
            <button
              onClick={() => removeTipo(tipo.id)}
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