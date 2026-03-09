"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  async function sair() {
    await signOut(auth);
    router.push("/login");
  }

  return (

    <div style={{padding:40}}>

      <h1>Dashboard</h1>

      <button onClick={sair}>
        Sair
      </button>

      <br/><br/>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>

        <Link href="/dashboard/produtos">
          Produtos
        </Link>

        <Link href="/dashboard/pedidos">
          Pedidos
        </Link>

        <Link href="/dashboard/cozinha">
          Cozinha
        </Link>

        <Link href="/dashboard/novo-pedido">
          Novo Pedido
        </Link>

      </div>

    </div>

  );

}