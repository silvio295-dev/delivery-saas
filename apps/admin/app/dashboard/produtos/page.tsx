"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseClient";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export default function ProdutosPage() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const tenantId = "empresa";

  async function loadCategories() {
    const q = query(
      collection(db, "tenants", tenantId, "categories")
    );

    const snapshot = await getDocs(q);

    const list: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    setCategories(list);
  }

  async function loadProducts() {
    const q = query(
      collection(db, "tenants", tenantId, "products")
    );

    const snapshot = await getDocs(q);

    const list: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    setProducts(list);
  }

  async function createProduct() {

    if (!name || !price || !categoryId) return;

    await addDoc(
      collection(db, "tenants", tenantId, "products"),
      {
        name,
        price: Number(price),
        categoryId,
        ativo: true,
      }
    );

    setName("");
    setPrice("");

    loadProducts();
  }

  async function deleteProduct(id: string) {

    await deleteDoc(
      doc(db, "tenants", tenantId, "products", id)
    );

    loadProducts();
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  function getCategoryName(id: string) {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "Categoria";
  }

  return (
    <div style={{ padding: 40 }}>

      <h1>Produtos do Cardápio</h1>

      <div style={{ marginTop: 20 }}>

        <input
          placeholder="Nome do produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >

          <option value="">Categoria</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

        <button onClick={createProduct}>
          Criar produto
        </button>

      </div>

      <div style={{ marginTop: 40 }}>

        {products.map((p) => (

          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
            }}
          >

            <div>
              <strong>{p.name}</strong>
              <div>R$ {p.price}</div>
              <div>{getCategoryName(p.categoryId)}</div>
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
            >
              Excluir
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}