"use client";

import { useEffect, useState } from "react";
import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { LuSearch} from "react-icons/lu";
import Link from "next/link";

interface Barber {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
}
interface Results{
    id: number;
  name: string;
}

export default function BarberServiceSearch() {
  const token = getCookieClient();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [results, setResults] = useState<Results[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar barbeiros e cortes na montagem
  useEffect(() => {
    async function fetchData() {
      try {
        const [barberRes, serviceRes] = await Promise.all([
          api.get("/barbers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/haircuts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBarbers(barberRes.data);
        setServices(serviceRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, [token]);

  // Buscar cortes por barbeiro
  async function searchByBarber(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBarber) return;

    setLoading(true);
    try {
      const response = await api.get('/barber/bybarber', {
        params:{
            barber_id:selectedBarber
        },
        headers: { Authorization: `Bearer ${token}` 
    },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços do barbeiro:", error);
    } finally {
      setLoading(false);
    }
  }

  // Buscar barbeiros por corte
  async function searchByService(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    try {
      const response = await api.get('/barber/byhaircut',{
            params:{
                haircut_id:selectedService
            },
          headers: { Authorization: `Bearer ${token}`
        },
    });
      setResults(response.data);
    } catch (error) {
      console.error("Erro ao buscar barbeiros do serviço:", error);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setResults([]);
    setSelectedBarber("");
    setSelectedService("");
  }

  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="flex w-full justify-end items-center">
            <Link href="/dashboard/schedule/servicos/create">
            <button className="border border-gray-300 px-3 py-2 rounded-md hover:bg-pink-500 hover:text-white transition">
                Adicionar
            </button>
        </Link>
        </div>
        <div className="flex flex-col gap-4 mb-4 w-full">
          <div className="flex w-full items-center justify-center">
            <h1 className="text-xl font-bold">Pesquisar</h1>
          </div>

          {/* Buscar cortes por barbeiro */}
          <form onSubmit={searchByBarber} className="flex gap-2">
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
            >
              <option value="">Selecione um barbeiro</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="p-2 border rounded-md hover:bg-pink-500 hover:text-white transition"
            >
              <LuSearch />
            </button>
          </form>

          {/* Buscar barbeiros por corte */}
          <form onSubmit={searchByService} className="flex gap-2">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
            >
              <option value="">Selecione um corte</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="p-2 border rounded-md hover:bg-pink-500 hover:text-white transition"
            >
              <LuSearch />
            </button>
          </form>

          <button
            onClick={clearResults}
            className="text-sm text-blue-500 hover:underline"
          >
            Limpar resultados
          </button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : results.length > 0 ? (
          <div className="gap-2  rounded-md p-2 flex flex-col w-full">
            {results.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 border rounded-md border-gray-300 p-2"
              >
                {item.name && (
                  <p>
                    <span className="font-semibold">Nome:</span> {item.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h1 className="text-center text-gray-500">
            Nenhum resultado encontrado
          </h1>
        )}
      </div>
    </div>
  );
}
