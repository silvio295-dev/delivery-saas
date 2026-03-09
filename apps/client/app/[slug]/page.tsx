"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

type Restaurant = {
  tenantId: string;
  nome: string;
  slug: string;
  ativo: boolean;
};

export default function RestaurantPage({ params }: any) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const ref = doc(db, "public_restaurants", slug);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setRestaurant(snap.data() as Restaurant);
        }
      } catch (error) {
        console.error("Erro ao carregar restaurante:", error);
      }

      setLoading(false);
    }

    if (slug) {
      loadRestaurant();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Carregando restaurante...</h2>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Restaurante não encontrado</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{restaurant.nome}</h1>
      <p>Slug: {restaurant.slug}</p>
      <p>TenantId: {restaurant.tenantId}</p>
    </div>
  );
}