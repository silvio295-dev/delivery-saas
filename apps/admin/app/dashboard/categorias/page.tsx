"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

type Category = {
  id: string;
  name: string;
  order: number;
  ativo: boolean;
};

export default function CategoriasPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // descobrir tenant do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const membershipRef = doc(db, "memberships", user.uid);
      const membershipSnap = await getDoc(membershipRef);

      if (membershipSnap.exists()) {
        const tenant = membershipSnap.data().tenantId;
        setTenantId(tenant);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // carregar categorias
  useEffect(() => {
    if (!tenantId) return;

    async function loadCategories() {
      const ref = collection(db, "tenants", tenantId, "categories");
      const snap = await getDocs(ref);

      const list: Category[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setCategories(list);
    }

    loadCategories();
  }, [tenantId]);

  // criar categoria
  async function createCategory() {
    if (!tenantId || !name) return;

    const ref = collection(db, "tenants", tenantId, "categories");

    await addDoc(ref, {
      name,
      order: categories.length + 1,
      ativo: true,
      createdAt: serverTimestamp(),
    });

    setName("");
    window.location.reload();
  }

  // excluir categoria
  async function deleteCategory(id: string) {
    if (!tenantId) return;

    const ref = doc(db, "tenants", tenantId, "categories", id);
    await deleteDoc(ref);

    setCategories(categories.filter((c) => c.id !== id));
  }

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Categorias do Cardápio</h1>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, marginRight: 10 }}
        />

        <button onClick={createCategory}>Criar categoria</button>
      </div>

      <div style={{ marginTop: 40 }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              padding: 10,
            }}
          >
            <span>{cat.name}</span>

            <button onClick={() => deleteCategory(cat.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}