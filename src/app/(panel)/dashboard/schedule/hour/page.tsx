"use client";

import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { LuSearch, LuTrash2, } from "react-icons/lu";
import { toast } from "react-toastify";

interface requestHours {
  id:number;
  barber_id: number;
  time: Date;
}

interface requestBarber{
  id:number;
  name:string;
}

export default function Hour() {
  const token = getCookieClient();

  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<requestHours[]>([]);
  const [timeFilter, setTimeFilter] = useState<Date | null>(null);
  const [barberFilter, setBarberFilter] = useState<requestBarber | null>(null);
  const [phoneFilter,setPhoneFilter]=useState("")


async function searchByPhone(e: React.FormEvent) {
  e.preventDefault();
  if (!timeFilter) return;

  setLoading(true);

  try {
    // 🔍 Buscar barbeiro pelo telefone
    const searchBarber = await api.get("/barber/detail", {
      params: { phone: phoneFilter },
      headers: { Authorization: `Bearer ${token}` },
    });

    const barber=searchBarber.data
    setBarberFilter(barber)


    if (!barber?.id) {
      throw new Error("Barbeiro não encontrado");
    }

    // Buscar horários disponíveis
    const response = await api.get("/hours/me", {
      params: { 
        time: timeFilter.toISOString().split("T")[0],
        barber_id: barber.id
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    setHours(response.data);
  } catch (error) {
    console.error("Erro na busca:", error);
    setPhoneFilter('');
    setHours([]);
  } finally {
    setLoading(false);
  }
}

async function handleDelete(id: number) {
  if (!window.confirm("Deseja realmente deletar este horário?")) {
    return;
  }

  try {
    setLoading(true);
    await api.delete("/hour/delete", {
      params: { id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Remove o horário da lista na interface
    const updatedHours = hours.filter((hour) => hour.id !== id);
    setHours(updatedHours);
    toast.success("Horário deletado com sucesso!");
  } catch (error) {
    toast.error(`Erro ao deletar horário! ${error}`);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="flex flex-col gap-4 mb-4 w-full">
          <div className="flex w-full justify-end">
            <Link href='/dashboard/schedule/hour/create'><button className="border border-gray-300 px-3 py-2 rounded-md hover:bg-pink-500 hover:text-white transition">Adicionar</button></Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <h1>Horarios do colaborador</h1>
          </div>

          <form onSubmit={searchByPhone} className="flex gap-2 flex-col">
            <input
              type="text"
              placeholder="Telefone"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
            />
            


            <DatePicker
              selected={timeFilter}
              onChange={(date) => setTimeFilter(date)}
              placeholderText="Data"
              className="border text-pink-500 border-gray-300 rounded-md px-3 py-2"
              calendarClassName="react-datepicker"
              dateFormat="dd/MM/yyyy"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="p-2 border gap-2 w-full justify-center items-center flex rounded-md hover:bg-pink-500 hover:text-white transition"
                disabled={loading}
              >
                Pesquisar<LuSearch />
              </button>
            </div>
          </form>

          <button
            onClick={() => {
              setHours([]);
              setPhoneFilter("");
              setTimeFilter(null);
              setBarberFilter(null);
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            Limpar resultados
          </button>
        </div>
        
        <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">{barberFilter?.name}</h2>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : hours.length > 0 ? (
          <div className="flex flex-col w-full gap-4">
            {hours.map((hour) => (
              <div
                key={hour.id}
                className="border gap-2 border-gray-300 rounded-md p-2 shadow-sm flex flex-row justify-around">
                <div className="text-sm text-gray-700">
                    {hour.time &&(
                    <p>
                       <span className="font-medium">Horários:</span>{" "}
                      {new Date(hour.time).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    )}
                </div>

                  <button
                    onClick={() => handleDelete(hour.id)}
                    className="text-red-500 hover:text-red-300"
                    title="Deletar horário"
                  >
                    <LuTrash2 />
                  </button>

              </div>
            ))}
          </div>
        ) : (
          <span className="text-center text-gray-500">
            Nenhum colaborador encontrado
            <p>
              Pesquise novamente
            </p>
          </span>
        )}
      </div>
    </div>
  );
}
