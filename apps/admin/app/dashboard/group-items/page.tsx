"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type Ingredient = {
  id: string;
  name: string;
};

type Group = {
  id: string;
  name: string;
};

type GroupItem = {
  id: string;
  ingredientId: string;
  groupId: string;
};

export default function GroupItemsPage() {
  const tenantId = "empresa";

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "ingredients"),
      where("tenantId", "==", tenantId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Ingredient[] = [];
      snap.forEach((doc) => {
        const d = doc.data() as any;
        data.push({
          id: doc.id,
          name: d.name,
        });
      });
      setIngredients(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "product_groups"),
      where("tenantId", "==", tenantId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Group[] = [];
      snap.forEach((doc) => {
        const d = doc.data() as any;
        data.push({
          id: doc.id,
          name: d.name,
        });
      });
      setGroups(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "group_items"),
      where("tenantId", "==", tenantId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: GroupItem[] = [];
      snap.forEach((doc) => {
        const d = doc.data() as any;
        data.push({
          id: doc.id,
          ingredientId: d.ingredientId,
          groupId: d.groupId,
        });
      });
      setGroupItems(data);
    });

    return () => unsub();
  }, []);

  async function addItem() {
    if (!selectedGroup || !selectedIngredient) return;

    await addDoc(collection(db, "group_items"), {
      tenantId,
      groupId: selectedGroup,
      ingredientId: selectedIngredient,
    });
  }

  async function removeItem(id: string) {
    await deleteDoc(doc(db, "group_items", id));
  }

  const currentItems = groupItems.filter((i) => i.groupId === selectedGroup);

  return (
    <div style={{ padding: 20 }}>
      <h1>Itens do Grupo</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Grupo: </label>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Selecione</option>

          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <>
          <h3>Ingredientes do grupo</h3>

          <ul>
            {currentItems.map((item) => {
              const ing = ingredients.find(
                (i) => i.id === item.ingredientId
              );

              return (
                <li key={item.id}>
                  {ing?.name}

                  <button
                    style={{
                      marginLeft: 10,
                      background: "red",
                      color: "white",
                    }}
                    onClick={() => removeItem(item.id)}
                  >
                    remover
                  </button>
                </li>
              );
            })}
          </ul>

          <h3>Adicionar ingrediente</h3>

          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <option value="">Selecione</option>

            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <button
            style={{ marginLeft: 10 }}
            onClick={addItem}
          >
            Adicionar
          </button>
        </>
      )}
    </div>
  );
}