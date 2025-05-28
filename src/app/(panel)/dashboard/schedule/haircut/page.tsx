"use client"
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuPencil, LuSave, LuSearch, LuX } from "react-icons/lu";

interface requestHaircuts {
  id: number;
  name: string;
  price: number;
  user_id: number;
}
export default function Haircut(){
      const token = getCookieClient();
    
      const [loading, setLoading] = useState(false);
      const [haircuts, setHaircuts] = useState<requestHaircuts[]>([]);
      const [status, setStatus] = useState(true);
      const [editClientId, setEditClientId] = useState<number | null>(null);
      const [editData, setEditData] = useState<Partial<requestHaircuts>>({});
      

      const handleToggle = () => {
        setStatus((prevStatus) => !prevStatus);
      };

      function handleEdit(haircut: requestHaircuts) {
        setEditClientId(haircut.id);
        setEditData({ ...haircut });
      }
    
      function handleCancel() {
        setEditClientId(null);
        setEditData({});
      }


    async function fetchHaircuts() {
      try {
        const response = await api.get('/haircuts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHaircuts(response.data);
        
      } catch (error) {
        console.error('Erro ao buscar cortes de cabelo:', error);
      }
      finally{
        setLoading(false);
        handleCancel();
      }
    }

    
      async function handleSave() {
        try {
          const response=await api.put(
            `/haircut/${editClientId}`,
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
          
          setHaircuts((prev) =>
          prev.map((haircut) =>
            haircut.id === editClientId ? response.data : haircut
          )
          );
          handleCancel();
        } catch (error) {
          console.error("Erro ao atualizar cliente:", error);
        }finally{
          fetchHaircuts()
        }
        
      }

    
      function handleChangeInput(
        e: React.ChangeEvent<HTMLInputElement>,  // Evento do input
        field: keyof requestHaircuts // O nome da propriedade que você quer alterar
      ) {
        const value =
          field === "price" ? Number(e.target.value.replace(",",".")) : e.target.value;
        setEditData((prev) => ({
          ...prev, // mantém os outros dados como estão
          [field]:value, // altera apenas o campo selecionado
        }));
      }

      useEffect(() => {
  fetchHaircuts();
}, [token]);



    return(
        <main className="flex flex-col rounded-md items-center justify-center container mx-auto min-h-screen">
            <div className="bg-white mb-20 p-6 rounded-xl shadow-md w-full max-w-sm">
                <div className="flex items-center flex-col gap-4 mb-4 w-full">
                    <div className="flex w-full justify-end gap-2">
                        <Link href='/dashboard/schedule/servicos'><button className="p-2 hover:bg-pink-500 hover:text-white transition border border-gray-300 rounded-md">Servicos</button></Link>
                        <Link href='/dashboard/schedule/haircut/create'><button className="border border-gray-300 px-3 py-2 rounded-md hover:bg-pink-500 hover:text-white transition">Adicionar</button></Link>
                    </div>
                    <h1>Lista de cortes</h1>
                </div>

        {loading ? (
          <p>Carregando...</p>
        ) : haircuts.length > 0 ? (
          <div className="flex flex-col w-full gap-4">
            {haircuts.map((haircut) => (
              <div
                key={haircut.id}
                className="border gap-2 border-gray-300 rounded-md p-2 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-lg">{haircut.name}</h2>
                  {editClientId === haircut.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="border rounded-full p-1 hover:bg-green-600 hover:text-white"
                      >
                        <LuSave />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="border rounded-full p-1 hover:bg-red-600 hover:text-white"
                      >
                        <LuX />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(haircut)}
                      className="border rounded-full p-1 hover:bg-pink-500 hover:text-white"
                    >
                      <LuPencil />
                    </button>
                  )}
                </div>

                {editClientId === haircut.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => handleChangeInput(e, "name")}
                      className="border rounded px-2 py-1"
                      placeholder="Nome"
                    />
                    <input
                      type="number"
                      value={editData.price || ""}
                      onChange={(e) => handleChangeInput(e, "price")}
                      className="border rounded px-2 py-1"
                      placeholder="Telefone"
                    />

                    <div>
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

                  </div>
                ) : (
                  <div className="text-sm text-gray-700">

                    <p>
                      <span className="font-medium">A partir de</span>{" "}
                      {haircut.price}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h1 className="text-center text-gray-500">
            Nenhum Corte encontrado
          </h1>
        )}
            </div>
        </main>
    )
}