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
  query,
  orderBy,
} from "firebase/firestore";

export default function OpcoesGrupoPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  async function loadTenant() {
    const user = auth.currentUser;
    if (!user) return;

    const membershipRef = doc(db, "memberships", user.uid);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) return;

    const data: any = membershipSnap.data();
    setTenantId(data.tenantId);

    await loadGroups(data.tenantId);
  }

  async function loadGroups(tid: string) {
    const ref = collection(db, "tenants", tid, "product_groups");
    const q = query(ref, orderBy("name"));
    const snap = await getDocs(q);

    const lista: any[] = [];
    snap.forEach((item) => {
      lista.push({
        id: item.id,
        ...item.data(),
      });
    });

    setGroups(lista);

    if (lista.length > 0) {
      const firstGroupId = lista[0].id;
      setSelectedGroupId(firstGroupId);
      await loadOptions(tid, firstGroupId);
    } else {
      setSelectedGroupId("");
      setOptions([]);
    }
  }

  async function loadOptions(tid: string, groupId: string) {
    const ref = collection(db, "tenants", tid, "product_groups", groupId, "options");
    const q = query(ref, orderBy("name"));
    const snap = await getDocs(q);

    const lista: any[] = [];
    snap.forEach((item) => {
      lista.push({
        id: item.id,
        ...item.data(),
      });
    });

    setOptions(lista);
  }

  async function handleChangeGroup(groupId: string) {
    setSelectedGroupId(groupId);

    if (!tenantId || !groupId) {
      setOptions([]);
      return;
    }

    await loadOptions(tenantId, groupId);
  }

  async function createOption() {
    if (!tenantId) return;
    if (!selectedGroupId) return;
    if (!name.trim()) return;

    const ref = collection(
      db,
      "tenants",
      tenantId,
      "product_groups",
      selectedGroupId,
      "options"
    );

    await addDoc(ref, {
      name: name.trim(),
      price: Number(price || 0),
    });

    setName("");
    setPrice("");

    await loadOptions(tenantId, selectedGroupId);
  }

  async function removeOption(id: string) {
    if (!tenantId) return;
    if (!selectedGroupId) return;

    const ref = doc(
      db,
      "tenants",
      tenantId,
      "product_groups",
      selectedGroupId,
      "options",
      id
    );

    await deleteDoc(ref);
    await loadOptions(tenantId, selectedGroupId);
  }

  useEffect(() => {
    loadTenant();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Opções dos Grupos</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select
          value={selectedGroupId}
          onChange={(e) => handleChangeGroup(e.target.value)}
        >
          <option value="">Selecione um grupo</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nome da opção"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Preço adicional"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={createOption}>Adicionar</button>
      </div>

      {groups.length === 0 ? (
        <p>Nenhum grupo cadastrado ainda.</p>
      ) : (
        <ul>
          {options.map((option) => (
            <li key={option.id} style={{ marginBottom: 10 }}>
              {option.name} - R$ {Number(option.price || 0).toFixed(2)}
              <button
                onClick={() => removeOption(option.id)}
                style={{ marginLeft: 10 }}
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