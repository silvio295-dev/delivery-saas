"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  productId: string;
  required: boolean;
}

export default function GruposPage() {

  const tenantId = "empresa";

  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [required, setRequired] = useState(false);

  async function loadProducts() {

    const snapshot = await getDocs(
      collection(db, "tenants", tenantId, "products")
    );

    const list: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    setProducts(list);
  }

  async function loadGroups() {

    const snapshot = await getDocs(
      collection(db, "tenants", tenantId, "product_groups")
    );

    const list: Group[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    setGroups(list);
  }

  async function createGroup() {

    if (!name || !productId) return;

    await addDoc(
      collection(db, "tenants", tenantId, "product_groups"),
      {
        name,
        productId,
        required,
        maxSelect: 1,
      }
    );

    setName("");
    setProductId("");
    setRequired(false);

    loadGroups();
  }

  async function deleteGroup(id: string) {

    await deleteDoc(
      doc(db, "tenants", tenantId, "product_groups", id)
    );

    loadGroups();
  }

  function getProductName(id: string) {
    const p = products.find((p) => p.id === id);
    return p ? p.name : "Produto";
  }

  useEffect(() => {
    loadProducts();
    loadGroups();
  }, []);

  return (
    <div style={{ padding: 40 }}>

      <h1>Grupos de Opções</h1>

      <div style={{ marginTop: 20 }}>

        <input
          placeholder="Nome do grupo (ex: Escolha o tamanho)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >

          <option value="">Produto</option>

          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}

        </select>

        <label style={{ marginLeft: 10 }}>
          Obrigatório
        </label>

        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />

        <button onClick={createGroup}>
          Criar grupo
        </button>

      </div>

      <div style={{ marginTop: 40 }}>

        {groups.map((g) => (

          <div
            key={g.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >

            <div>

              <strong>{g.name}</strong>

              <div>
                Produto: {getProductName(g.productId)}
              </div>

              <div>
                Obrigatório: {g.required ? "Sim" : "Não"}
              </div>

            </div>

            <button onClick={() => deleteGroup(g.id)}>
              Excluir
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}