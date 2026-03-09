"use client";

import { useEffect, useState } from "react";
import { escutarPedidos, atualizarStatusPedido } from "../../../lib/pedidos";

type PedidoItem = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type Pedido = {
  id: string;
  clienteNome: string;
  status: string;
  total: number;
  items: PedidoItem[];
};

export default function CozinhaPage() {

  const [pedidos,setPedidos] = useState<Pedido[]>([]);

  useEffect(()=>{

    const unsubscribe = escutarPedidos(
      "empresa",
      (lista)=>{

        setPedidos(lista as Pedido[]);

      }
    );

    return ()=>unsubscribe();

  },[]);

  async function mover(id:string,status:string){

    await atualizarStatusPedido(id,status);

  }

  const novos = pedidos.filter(p=>p.status==="novo");
  const preparando = pedidos.filter(p=>p.status==="preparando");
  const entrega = pedidos.filter(p=>p.status==="entrega");

  function coluna(titulo:string,lista:Pedido[],acao:string){

    return(

      <div
        style={{
          flex:1,
          padding:20
        }}
      >

        <h2>{titulo}</h2>

        {lista.map(p=>(

          <div
            key={p.id}
            style={{
              border:"1px solid #ccc",
              padding:15,
              marginBottom:15
            }}
          >

            <strong>{p.clienteNome}</strong>

            <div>

              {p.items?.map((i,index)=>(
                <div key={index}>
                  {i.nome} x{i.quantidade}
                </div>
              ))}

            </div>

            <div>
              Total: R$ {p.total}
            </div>

            {acao && (

              <button
                onClick={()=>mover(p.id,acao)}
              >
                Avançar
              </button>

            )}

          </div>

        ))}

      </div>

    );

  }

  return(

    <div style={{padding:40}}>

      <h1>Painel de Cozinha</h1>

      <div
        style={{
          display:"flex",
          gap:20
        }}
      >

        {coluna("NOVOS",novos,"preparando")}
        {coluna("PREPARANDO",preparando,"entrega")}
        {coluna("ENTREGA",entrega,"")}

      </div>

    </div>

  );

}