"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ProductLinksPage() {
  const tenantId = "empresa";

  const [products, setProducts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  const [productId, setProductId] = useState("");
  const [groupId, setGroupId] = useState("");

  async function loadData() {
    const productsRef = query(
      collection(db, "products"),
      where("tenantId", "==", tenantId)
    );

    const groupsRef = query(
      collection(db, "product_groups"),
      where("tenantId", "==", tenantId)
    );

    const linksRef = query(
      collection(db, "product_group_links"),
      where("tenantId", "==", tenantId)
    );

    const pSnap = await getDocs(productsRef);
    const gSnap = await getDocs(groupsRef);
    const lSnap = await getDocs(linksRef);

    const p: any[] = [];
    const g: any[] = [];
    const l: any[] = [];

    pSnap.forEach((d) => p.push({ id: d.id, ...d.data() }));
    gSnap.forEach((d) => g.push({ id: d.id, ...d.data() }));
    lSnap.forEach((d) => l.push({ id: d.id, ...d.data() }));

    setProducts(p);
    setGroups(g);
    setLinks(l);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createLink() {
    if (!productId || !groupId) return;

    await addDoc(collection(db, "product_group_links"), {
      tenantId,
      productId,
      groupId,
    });

    setProductId("");
    setGroupId("");

    loadData();
  }

  async function removeLink(id: string) {
    await deleteDoc(doc(db, "product_group_links", id));
    loadData();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Ligação Produto → Grupos</h1>

      <div style={{ marginBottom: 20 }}>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Selecione produto</option>

          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Selecione grupo</option>

          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button onClick={createLink}>Adicionar</button>
      </div>

      <h2>Links criados</h2>

      <ul>
        {links.map((l) => {
          const product = products.find((p) => p.id === l.productId);
          const group = groups.find((g) => g.id === l.groupId);

          return (
            <li key={l.id}>
              {product?.name} → {group?.name}

              <button
                onClick={() => removeLink(l.id)}
                style={{ marginLeft: 10, background: "red", color: "#fff" }}
              >
                remover
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}