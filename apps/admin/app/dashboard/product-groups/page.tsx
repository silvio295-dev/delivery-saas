"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "@/lib/firebaseClient";

type Group = {
  id: string;
  name: string;
};

export default function ProductGroupsPage() {

  const tenantId = "empresa";

  const [name, setName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function loadGroups() {

    const q = query(
      collection(db, "product_groups"),
      where("tenantId", "==", tenantId)
    );

    const snapshot = await getDocs(q);

    const list: Group[] = [];

    snapshot.forEach((docItem) => {

      const data: any = docItem.data();

      if (!data.name) return;

      list.push({
        id: docItem.id,
        name: data.name
      });

    });

    setGroups(list);
  }

  async function addGroup() {

    if (!name) {
      alert("Digite o nome do grupo");
      return;
    }

    await addDoc(
      collection(db, "product_groups"),
      {
        tenantId: tenantId,
        name: name.trim()
      }
    );

    setName("");

    loadGroups();
  }

  async function deleteGroup(id: string) {

    await deleteDoc(
      doc(db, "product_groups", id)
    );

    loadGroups();
  }

  function startEdit(group: Group) {

    setEditingId(group.id);
    setEditingName(group.name);
  }

  async function saveEdit(id: string) {

    if (!editingName) {
      alert("Nome inválido");
      return;
    }

    await updateDoc(
      doc(db, "product_groups", id),
      {
        name: editingName
      }
    );

    setEditingId(null);

    loadGroups();
  }

  useEffect(() => {
    loadGroups();
  }, []);

  return (

    <div style={{ padding: 20 }}>

      <h1>Grupos de adicionais</h1>

      <div style={{ marginBottom: 20 }}>

        <input
          placeholder="Nome do grupo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addGroup}>
          Criar grupo
        </button>

      </div>

      <ul>

        {groups.map((group) => (

          <li key={group.id} style={{ marginBottom: 10 }}>

            {editingId === group.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />

                <button onClick={() => saveEdit(group.id)}>
                  Salvar
                </button>
              </>
            ) : (
              <>
                {group.name}

                <button
                  onClick={() => startEdit(group)}
                  style={{ marginLeft: 10 }}
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteGroup(group.id)}
                  style={{
                    marginLeft: 10,
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer"
                  }}
                >
                  Excluir
                </button>
              </>
            )}

          </li>

        ))}

      </ul>

    </div>
  );
}