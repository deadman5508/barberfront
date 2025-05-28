"use client"
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { toast } from "react-toastify";

interface requestClients {
  name: string;
  price: number;
  duration:number
}

export default function Createhaircut(){
    const token = getCookieClient();
    const [editData, setEditData] = useState<Partial<requestClients>>({});
    const [status, setStatus] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleToggle = () => {
      setStatus((prevStatus) => !prevStatus);
    };

    function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement>,  // Evento do input
    field: keyof requestClients // O nome da propriedade que você quer alterar
  ) {
    const numericFields = ["price", "duration"];
    const value =
          numericFields.includes(field) ? Number(e.target.value.replace(",",".")) : e.target.value;
    setEditData((prev) => ({
      ...prev, // mantém os outros dados como estão
      [field]:value, // altera apenas o campo selecionado
    }));
  }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response=await api.post(
              '/haircut',
              {
                ...editData,
                status: status,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

      if (!response) {
        toast.error( "Erro ao cadastrar corte.");
        return;
      }

      toast.success("Corte cadastrado com sucesso!");
      setEditData({}); // Limpa os campos após sucesso
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao cadastrar corte.");
    }finally {
    setIsSubmitting(false);
  }
  }
    return(
        <main className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
            <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
                <div className="flex w-full justify-start">
                    <Link href='/dashboard/schedule/haircut' className=" border border-gray-300 items-center justify-center flex w-fit gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"><LuArrowLeft/>voltar</Link>
                </div>
                <div className="mb-4">
                    <h1>Cadastrar Serviços</h1>
                </div>
                <div className="w-full flex flex-row gap-2 mb-2">
                  <span>Para os cabelos?</span>
                    <button
                      onClick={handleToggle}
                      className={`${
                        status ? "bg-pink-500" : "bg-gray-300"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                    >
                      <span
                        className={`${
                          status ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => handleChangeInput(e, "name")}
                      className="border rounded px-2 py-1"
                      placeholder="Nome do corte"
                      required
                    />
                    <input
                      type="number"
                      value={editData.price || ""}
                      onChange={(e) => handleChangeInput(e, "price")}
                      className="border rounded px-2 py-1"
                      placeholder="Preço"
                      required
                    />
                    <input
                      type="number"
                      value={editData.duration || 1}
                      onChange={(e) => handleChangeInput(e, "duration")}
                      className="border rounded px-2 py-1"
                      placeholder="Duração"
                      required
                    />
                    <button
                    type="submit"
                    className="bg-pink-500 text-white rounded px-4 py-2 hover:bg-white hover:text-pink-500 transition"
                    >{isSubmitting ? "Cadastrando..." : "Cadastrar"}</button>
                  </div>
                </form>
            </div>
            
        </main>
    )
}