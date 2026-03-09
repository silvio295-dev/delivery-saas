"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Membership = {
  tenantId: string;
  role: string;
  userId: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@admin.com");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Se já estiver logado e tiver membership, manda pro dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const ref = doc(db, "memberships", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          router.replace("/dashboard");
        } else {
          setErro(
            `Você logou, mas não existe memberships/${user.uid}. Crie o documento de membership.`
          );
        }
      } catch (e: any) {
        setErro(e?.message ?? "Erro ao validar membership.");
      }
    });

    return () => unsub();
  }, [router]);

  async function login() {
    setErro(null);

    const emailTrim = email.trim();
    if (!emailTrim) return setErro("Informe o e-mail.");
    if (!senha) return setErro("Informe a senha.");

    try {
      setLoading(true);

      const cred = await signInWithEmailAndPassword(auth, emailTrim, senha);

      // valida membership
      const ref = doc(db, "memberships", cred.user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setErro(
          `Você logou, mas não existe memberships/${cred.user.uid}. Crie o documento de membership.`
        );
        return;
      }

      const m = snap.data() as Membership;
      if (!m.tenantId) {
        setErro("Membership inválida: faltou tenantId.");
        return;
      }

      router.push("/dashboard");
    } catch (e: any) {
      setErro(e?.code ?? e?.message ?? "Erro no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: 420, maxWidth: "90vw" }}>
        <h1 style={{ fontSize: 48, margin: 0, textAlign: "center" }}>Painel Admin</h1>

        <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
          <label style={{ fontSize: 12, opacity: 0.8 }}>E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff9c4",
            }}
          />

          <label style={{ fontSize: 12, opacity: 0.8 }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff9c4",
            }}
          />

          <button
            onClick={login}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: 14,
              borderRadius: 8,
              border: "2px solid #111",
              background: "white",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && (
            <div style={{ color: "red", marginTop: 8, whiteSpace: "pre-wrap" }}>
              {erro}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}