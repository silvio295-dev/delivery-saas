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

type Ingredient = {
  id: string;
  name: string;
  price: number;
};

export default function IngredientesPage() {

  const tenantId = "empresa";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");

  async function loadIngredients() {

    const q = query(
      collection(db, "ingredients"),
      where("tenantId", "==", tenantId)
    );

    const snapshot = await getDocs(q);

    const list: Ingredient[] = [];

    snapshot.forEach((docItem) => {
      const data: any = docItem.data();

      const n = data?.name ?? "";
      const p = Number(data?.price);

      if (!n || isNaN(p)) return;

      list.push({
        id: docItem.id,
        name: n,
        price: p
      });
    });

    setIngredients(list);
  }

  async function addIngredient() {

    const parsedPrice = Number(price);

    if (!name || isNaN(parsedPrice)) {
      alert("Preencha nome e preço corretamente");
      return;
    }

    await addDoc(
      collection(db, "ingredients"),
      {
        tenantId: tenantId,
        name: name.trim(),
        price: parsedPrice
      }
    );

    setName("");
    setPrice("");

    loadIngredients();
  }

  async function deleteIngredient(id: string) {

    await deleteDoc(
      doc(db, "ingredients", id)
    );

    loadIngredients();
  }

  function startEdit(ing: Ingredient) {

    setEditingId(ing.id);
    setEditingName(ing.name);
    setEditingPrice(String(ing.price));
  }

  async function saveEdit(id: string) {

    const parsedPrice = Number(editingPrice);

    if (!editingName || isNaN(parsedPrice)) {
      alert("Dados inválidos");
      return;
    }

    await updateDoc(
      doc(db, "ingredients", id),
      {
        name: editingName,
        price: parsedPrice
      }
    );

    setEditingId(null);

    loadIngredients();
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  return (
    <div style={{ padding: 20 }}>

      <h1>Ingredientes</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome do ingrediente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Preço adicional"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={addIngredient}>
          Adicionar
        </button>
      </div>

      <ul>

        {ingredients.map((ing) => (

          <li key={ing.id} style={{ marginBottom: 10 }}>

            {editingId === ing.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />

                <input
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                />

                <button onClick={() => saveEdit(ing.id)}>
                  Salvar
                </button>
              </>
            ) : (
              <>
                {ing.name} - R$ {ing.price.toFixed(2)}

                <button
                  onClick={() => startEdit(ing)}
                  style={{ marginLeft: 10 }}
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteIngredient(ing.id)}
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