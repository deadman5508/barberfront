"use client";

import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { toast } from "react-toastify";

interface Barber {
  id: number;
  name: string;
}

interface Haircut {
  id: number;
  name: string;
  price: number;
}

export default function LinkBarberToHaircut() {
    const token = getCookieClient();

    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [haircuts, setHaircuts] = useState<Haircut[]>([]);
    const [phone, setPhone] = useState("");
    const [selectedBarber, setSelectedBarber] = useState<number|null>(null);
    const [selectedHaircut, setSelectedHaircut] = useState<number[]>([]);

  // Carrega barbeiros e cortes na montagem da página
  useEffect(() => {
    async function fetchData() {
      try {
        const [barbersRes, haircutsRes] = await Promise.all([
          api.get("/barbers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/haircuts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBarbers(barbersRes.data);
        setHaircuts(haircutsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar barbeiros ou cortes.");
      }
    }

    fetchData();
  }, [token]);

  // Submete o vínculo
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBarber || !selectedHaircut) {
      toast.error("Selecione um barbeiro e um corte.");
      return;
    }

    try {
      await api.post(
        "/barberhaircut",
        {
          barber_id: Number(selectedBarber),
          haircut_ids: selectedHaircut,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Vínculo criado com sucesso!");
      setSelectedBarber(null);
      setSelectedHaircut([]);
    } catch (error) {
      console.error("Erro ao vincular:", error);
      toast.error("Erro ao criar vínculo.");
    }
  }

  return (
    <main className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="flex w-full justify-start">
          <Link
            href="/dashboard/schedule/servicos"
            className="border border-gray-300 items-center justify-center flex w-fit gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
          >
            <LuArrowLeft />
            voltar
          </Link>
        </div>
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Vincular Barbeiro aos Cortes</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <select
            value={selectedBarber??''}
            onChange={(e) => {
            const value = e.target.value;
            setSelectedBarber(value ? Number(value) : null);
          }}
            className="border rounded px-2 py-2 text-pink-500"
            required
          >
            <option value="">Selecione um Barbeiro</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <p className="text-pink-500 font-semibold">Selecione um ou mais cortes:</p>
            {haircuts.map((cut) => (
              <label key={cut.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={cut.id}
                  checked={selectedHaircut.includes(cut.id)}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (e.target.checked) {
                      setSelectedHaircut([...selectedHaircut, value]);
                    } else {
                      setSelectedHaircut(selectedHaircut.filter((id) => id !== value));
                    }
                  }}
                  className="accent-pink-500"
                />
                <span>{cut.name} - R$ {cut.price}</span>
              </label>
            ))}
          </div>


          <button
            type="submit"
            className="bg-pink-500 text-white rounded px-4 py-2 hover:bg-white hover:text-pink-500 transition"
          >
            Vincular
          </button>
        </form>
      </div>
    </main>
  );
}
