"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";

export type Membership = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "member" | string;
  createdAt?: any;
};

type UseAuthMembershipResult = {
  loading: boolean;
  user: User | null;
  membership: Membership | null;
  tenantId: string | null;
  role: string | null;
  error: string | null;
};

export function useAuthMembership(): UseAuthMembershipResult {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!alive) return;

      setLoading(true);
      setError(null);
      setUser(u);
      setMembership(null);
      setTenantId(null);
      setRole(null);

      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "memberships", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError(`Você logou, mas não existe memberships/${u.uid}. Crie o documento de membership.`);
          setLoading(false);
          return;
        }

        const data = snap.data() as any;

        const m: Membership = {
          userId: data.userId ?? u.uid,
          tenantId: data.tenantId ?? null,
          role: data.role ?? null,
          createdAt: data.createdAt,
        };

        setMembership(m);
        setTenantId(m.tenantId ?? null);
        setRole(m.role ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar membership.");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return { loading, user, membership, tenantId, role, error };
}