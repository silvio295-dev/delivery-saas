"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function NovoPedido() {

  const [cliente,setCliente] = useState("");
  const [produto,setProduto] = useState("");
  const [preco,setPreco] = useState(0);
  const [quantidade,setQuantidade] = useState(1);

  async function criarPedido(){

    const total = preco * quantidade;

    await addDoc(collection(db,"pedidos"),{

      clienteNome: cliente,
      status: "novo",
      tenantId: "empresa",
      total: total,

      items:[
        {
          nome: produto,
          preco: preco,
          quantidade: quantidade,
          produtoId: "manual"
        }
      ]

    });

    alert("Pedido criado!");

  }

  return (

    <div style={{padding:40}}>

      <h1>Novo Pedido</h1>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e)=>setCliente(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Produto"
        value={produto}
        onChange={(e)=>setProduto(e.target.value)}
      />

      <br/><br/>

      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e)=>setPreco(Number(e.target.value))}
      />

      <br/><br/>

      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e)=>setQuantidade(Number(e.target.value))}
      />

      <br/><br/>

      <button onClick={criarPedido}>
        Criar Pedido
      </button>

    </div>

  );
}