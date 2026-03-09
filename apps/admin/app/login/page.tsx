"use client";

import { auth } from "../../lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  async function login(e:any){

    e.preventDefault();

    const form = e.target;

    const email = form.email.value.trim();
    const senha = form.senha.value.trim();

    if(!email){
      alert("Digite o email");
      return;
    }

    if(!senha){
      alert("Digite a senha");
      return;
    }

    try{

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      router.push("/dashboard");

    }catch(error){

      console.error(error);
      alert("Erro no login");

    }

  }

  return(

    <div style={{padding:40}}>

      <h1>Login</h1>

      <form onSubmit={login}>

        <div>
          <input
            name="email"
            type="email"
            placeholder="email"
          />
        </div>

        <div>
          <input
            name="senha"
            type="password"
            placeholder="senha"
          />
        </div>

        <button type="submit">
          Entrar
        </button>

      </form>

    </div>

  );

}