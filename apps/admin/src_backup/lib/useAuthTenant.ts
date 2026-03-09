"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseClient";
import { getMyMembership, Membership } from "./getMembership";

export function useAuthTenant() {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setMembership(null);
          setLoading(false);
          return;
        }

        const m = await getMyMembership();
        setMembership(m);
      } catch {
        setMembership(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { loading, membership };
}