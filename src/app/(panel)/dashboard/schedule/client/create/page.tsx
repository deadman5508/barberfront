"use client"
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { toast } from "react-toastify";

interface requestClients {
  name: string;
  address: string;
  cep: string;
  document: string;
  phone: string;
  user_id: number;
  birthday?: Date;
}

export default function CreateClient(){
    const token = getCookieClient();
    const [editData, setEditData] = useState<Partial<requestClients>>({});
    
    
    function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement>,  // Evento do input
    field: keyof requestClients // O nome da propriedade que você quer alterar
  ) {
    setEditData((prev) => ({
      ...prev, // mantém os outros dados como estão
      [field]: e.target.value, // altera apenas o campo selecionado
    }));
  }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response=await api.post(
              '/client',
              {
                ...editData,
                 birthday: editData.birthday ? new Date(editData.birthday) : null,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

      if (!response) {
        toast.error( "Erro ao cadastrar cliente.");
        return;
      }

      toast.success("Cliente cadastrado com sucesso!");
      setEditData({}); // Limpa os campos após sucesso
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao cadastrar cliente.");
    }
  }
    return(
        <main className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
            <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
                <div className="flex w-full justify-start">
                    <Link href='/dashboard/schedule/client' className=" border border-gray-300 items-center justify-center flex w-fit gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"><LuArrowLeft/>voltar</Link>
                </div>
                <div className="mb-4">
                    <h1>Cadastrar Clientes</h1>
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => handleChangeInput(e, "name")}
                      className="border rounded px-2 py-3"
                      placeholder="Nome"
                      required
                    />
                    <input
                      type="text"
                      value={editData.phone || ""}
                      onChange={(e) => handleChangeInput(e, "phone")}
                      className="border rounded px-2 py-3"
                      placeholder="Telefone"
                      required
                    />
                    <input
                      type="text"
                      value={editData.document || ""}
                      onChange={(e) => handleChangeInput(e, "document")}
                      className="border rounded px-2 py-3"
                      placeholder="CPF"
                      required
                    />
                    <input
                      type="text"
                      value={editData.address || ""}
                      onChange={(e) => handleChangeInput(e, "address")}
                      className="border rounded px-2 py-3"
                      placeholder="Endereço"
                    />
                    <input
                      type="text"
                      value={editData.cep || ""}
                      onChange={(e) => handleChangeInput(e, "cep")}
                      className="border rounded px-2 py-3"
                      placeholder="CEP"
                    />
                    <input
                      type="date"
                      value={
                        editData.birthday
                          ? new Date(editData.birthday)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) => handleChangeInput(e, "birthday")}
                      className="border rounded px-2 py-3"
                    />
                    <button
                    type="submit"
                    className="bg-pink-500 text-white rounded px-4 py-3 hover:bg-white hover:text-pink-500 transition"
                    >Cadastrar</button>
                  </div>
                </form>
            </div>
            
        </main>
    )
}