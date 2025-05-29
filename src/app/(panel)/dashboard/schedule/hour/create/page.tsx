"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import { LuArrowLeft, LuLoaderCircle, LuSearch, } from "react-icons/lu";
import { getCookieClient } from "@/lib/cookieClient";
import Link from "next/link";

interface Barber {
  id: number;
  name: string;
  phone: string;
}

export default function CreateHours() {
    const token = getCookieClient();
  const [phone, setPhone] = useState("");
  const [barber, setBarber] = useState<Barber | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearchBarber(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      toast.error("Digite um telefone para buscar o barbeiro");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/barber/detail", {
        params: { phone },
        headers: { Authorization: `Bearer ${token}` }
      });
      setBarber(response.data);
      toast.success(`Barbeiro ${response.data.name} encontrado!`);
    } catch (err) {
      toast.error(`Colaborador não encontrado. ${err}`);
      setBarber(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!startDate || !endDate || !startHour || !endHour) {
      toast.error("Preencha todos os campos!");
      return;
    }
    if (!barber) {
      toast.error("Localize seu colaborador!");
      return;
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);

    if (endD < startD) {
    toast.error("A data final não pode ser menor que a data inicial!");
    return;
    }

    const start = parseInt(startHour.split(":")[0]);
    const end = parseInt(endHour.split(":")[0]);

    if (end < start) {
    toast.error("A hora final não pode ser menor que à hora inicial!");
    return;
    }

    setLoading(true);

    

    try {
      const response = await api.post("/hours", {
        barber_id: Number(barber.id),
        startDate,
        endDate,
        startHour,
        endHour,
        
      },{
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data.result.message || "Horários criados com sucesso!");
      
      // Limpar campos
      setBarber(null);
      setStartDate("");
      setEndDate("");
      setStartHour("");
      setEndHour("");
    } catch (error) {
    toast.error(`Erro ao criar horários. ${error}`);
    console.log(error)
    } finally {
      setLoading(false);
    }
  }

  return (
<main className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
    <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="flex w-full justify-start">
            <Link href='/dashboard/schedule/hour' className=" border border-gray-300 items-center justify-center flex w-fit gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"><LuArrowLeft/>voltar</Link>
        </div>
        <h1 className="mb-2">Criar Grade de Horários</h1>

        <div className="mb-2">
            <form onSubmit={handleSearchBarber} className="gap-2 flex">
                <input
                type="text"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2 border rounded-md border-gray-300"
                />
                <button type="submit" disabled={loading} className="p-2 border gap-2 w-full justify-center items-center flex rounded-md hover:bg-pink-500 hover:text-white transition">
                    {loading ? <LuLoaderCircle/> : <LuSearch/>}
                </button>
            </form>
        </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {barber ? (
          <div className="flex w-full items-center justify-center">
            <h2>{barber?.name}</h2>
          </div>
        ):(<div className="flex w-full items-center justify-center">
            <h2>Pesquise seu colaborador</h2>
          </div>
          )}

        <label>
          Data Inicial:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
          />
        </label>

        <label>
          Data Final:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
          />
        </label>

        <label>
          Hora Inicial:
            <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
                >
                <option value="">Selecione</option>
                {Array.from({ length: 10 }, (_, i) => {
                const hour = (i + 9).toString().padStart(2, '0');
                return (
                    <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                    </option>
                );
                })}
            </select>
        </label>

        <label>
          Hora Final:
            <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
                >
                <option value="">Selecione</option>
                {Array.from({ length: 10 }, (_, i) => {
                const hour = (i + 9).toString().padStart(2, '0');
                return (
                    <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                    </option>
                );
                })}
            </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="p-2 border gap-2 w-full justify-center items-center flex rounded-md hover:bg-pink-500 hover:text-white transition"
        >
          {loading ? "Salvando..." : "Criar Horários"}
        </button>
      </form>
    </div>
</main>
  );
}
