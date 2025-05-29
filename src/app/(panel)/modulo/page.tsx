"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {getModuleCookieClient } from "@/lib/cookieClient";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { format, parseISO} from "date-fns";

interface CustomerRequest {
  id: number;
  name: string
}

interface Haircut {
  id: number;
  name: string;
  price: string;
  status: boolean;
}

interface Barber {
  id: number;
  name: string;
}

interface Hour {
  id: number;
  time: string; // "2024-05-26T14:00:00.000Z"
}

export default function CreateAppointment() {
  const tokenm = getModuleCookieClient();

  const [customer, setCustomer] = useState<CustomerRequest | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [selectedHaircuts, setSelectedHaircuts] = useState<number[]>([]);

  const [barbers, setBarbers] = useState<{ haircutId: number; barbers: Barber[] }[]>([]);
  const [barberIds, setBarberIds] = useState<{ haircutId: number; barberId: string }[]>([]);

  const [availableHours, setAvailableHours] = useState<Hour[]>([]);
  const [selectedHour, setSelectedHour] = useState<string>("");


    useEffect(() => {
    async function loadClientes() {
      try {
        const response = await api.get("/phone/me", {
          headers: { Authorization: `Bearer ${tokenm}` },
        });
        setCustomer(response.data);
      } catch {
        toast.error("Erro ao carregar cortes");
      }
    }
    loadClientes();
  }, [tokenm]);



  // 🔥 Carregar cortes
  useEffect(() => {
    async function loadHaircuts() {
      try {
        const response = await api.get("/phone/haircuts", {
          headers: { Authorization: `Bearer ${tokenm}` },
        });
        setHaircuts(response.data);
      } catch {
        toast.error("Erro ao carregar cortes");
      }
    }
    loadHaircuts();
  }, [tokenm]);

  // 🔍 Buscar barbeiros
  useEffect(() => {
    async function fetchBarbers() {
      const newBarbers: { haircutId: number; barbers: Barber[] }[] = [];

      for (const haircutId of selectedHaircuts) {
        try {
          const response = await api.get("/phone/barber/byhaircut", {
            params: { haircut_id: haircutId },
            headers: { Authorization: `Bearer ${tokenm}` },
          });

          newBarbers.push({
            haircutId,
            barbers: response.data,
          });
        } catch {
          toast.error(`Erro ao buscar barbeiros do serviço ${haircutId}`);
        }
      }

      setBarbers(newBarbers);
    }

    if (selectedHaircuts.length) {
      fetchBarbers();
    } else {
      setBarbers([]);
    }
  }, [selectedHaircuts, tokenm]);

  // 🕑 Buscar horários disponíveis
  useEffect(() => {
    async function fetchHours() {
      if (!date) return;

      const barberSelected = barberIds[0]?.barberId;

      if (!barberSelected) {
        setAvailableHours([]);
        return;
      }

      try {
        const response = await api.get("/phone/hours/me", {
          params: {
            barber_id: barberSelected,
            time: format(date, "yyyy-MM-dd"),
          },
          headers: { Authorization: `Bearer ${tokenm}` },
        });
        setAvailableHours(response.data);
        const hours = response.data;
      setAvailableHours(hours);

      if (hours.length === 0) {
        toast.info("Nenhum horário disponível para essa data.");
      }
      } catch {
        toast.error("Erro ao buscar horários disponíveis.");
        setAvailableHours([]);
      }
    }

    fetchHours();
  }, [date, barberIds, tokenm]);

  // ✅ Seleção do barbeiro
  const handleBarberChange = (haircutId: number, selectedBarberId: string) => {
    setBarberIds((prev) => {
      const exists = prev.find((b) => b.haircutId === haircutId);
      if (exists) {
        return prev.map((b) =>
          b.haircutId === haircutId ? { ...b, barberId: selectedBarberId } : b
        );
      } else {
        return [...prev, { haircutId, barberId: selectedBarberId }];
      }
    });
  };

  // 🚀 Enviar agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allBarbersSelected = selectedHaircuts.every((haircutId) =>
      barberIds.find((b) => b.haircutId === haircutId)
    );


    if (!allBarbersSelected) {
      toast.error("Selecione um profissional para cada serviço!");
      return;
    }
    
    if (!name) {
      toast.error("Digite o nome de quem será agendado.");
      return;
    }

    if (!customer) {
      toast.error("Busque um cliente antes de agendar.");
      return;
    }

    if (!selectedHour) {
      toast.error("Selecione um horário disponível.");
      return;
    }



      const formathour = `${format(date as Date, "yyyy-MM-dd")}T${selectedHour}`
      const scheduledDate = parseISO(formathour)
      const now=new Date()
      const minDifference = 4 * 60 * 60 * 1000;
      if (scheduledDate.getTime() - now.getTime() < minDifference) {
      toast.error("Agendamento mínimo de 4 horas de diferença");
      return
    }

    try {
      await api.post(
        "/phone/appointment",
        {
          name:name,
          customer: customer.name,
          date: `${format(date as Date, "yyyy-MM-dd")}T${selectedHour}`,
          description,
          client_id: customer.id,
          haircut_ids: selectedHaircuts,
          barber_ids: barberIds.map((b) => Number(b.barberId)),
        },
        {
          headers: { Authorization: `Bearer ${tokenm}` },
        }
      );

      toast.success("Agendamento criado com sucesso!");

      setCustomer(null);
      setDescription("");
      setDate(null);
      setSelectedHaircuts([]);
      setBarberIds([]);
      setBarbers([]);
      setSelectedHour("");
      setAvailableHours([]);
    } catch (err){
      toast.error(`Erro ao criar agendamento ${err}`);
    }
  
  }
  

  const haircutsTrue = haircuts.filter((cut) => cut.status === true);
  const haircutsFalse = haircuts.filter((cut) => cut.status === false);

  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white mb-20 container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm">

        {/* ✅ Nome do Cliente */}
        <div className="mb-4">
          
            <h1 className="font-semibold">Bem vindo, {customer?.name}</h1>
            
        </div>

        {/* 📅 Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-3">
          {/* ✅ Serviços Ativos */}

          <label className="mb-2">
              <label className="text-black" htmlFor="text">Nome:</label>
              <input
                type="text"
                placeholder="Digite o nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-3 py-2 rounded-md w-full mt-2 border-gray-300"
              />
            </label>
          <div className="flex flex-col gap-2 border px-2 py-3 rounded-md border-gray-300">
            <label className="font-medium">Cabelo:</label>
            {haircutsTrue.map((cut) => (
              <label key={cut.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedHaircuts.includes(cut.id)}
                  onChange={() => {
                    if (selectedHaircuts.includes(cut.id)) {
                      setSelectedHaircuts(
                        selectedHaircuts.filter((id) => id !== cut.id)
                      );
                      setBarberIds(barberIds.filter((b) => b.haircutId !== cut.id));
                    } else {
                      setSelectedHaircuts([...selectedHaircuts, cut.id]);
                    }
                  }}
                />
                {cut.name} - A partir de R$ {cut.price}
              </label>
            ))}
          

          {/* ✅ Serviços Inativos */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Mãos:</label>
            {haircutsFalse.map((cut) => (
              <label key={cut.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedHaircuts.includes(cut.id)}
                  onChange={() => {
                    if (selectedHaircuts.includes(cut.id)) {
                      setSelectedHaircuts(
                        selectedHaircuts.filter((id) => id !== cut.id)
                      );
                      setBarberIds(barberIds.filter((b) => b.haircutId !== cut.id));
                    } else {
                      setSelectedHaircuts([...selectedHaircuts, cut.id]);
                    }
                  }}
                />
                {cut.name} - A partir de R$ {cut.price}
              </label>
            ))}
          </div>
          </div>

          {/* 🔥 Profissionais */}
          {selectedHaircuts.map((haircutId) => {
            const haircut = haircuts.find((cut) => cut.id === haircutId);
            const availableBarbers = barbers.find((b) => b.haircutId === haircutId)?.barbers || [];

            return (
              <div
                key={haircutId}
                className="flex flex-col gap-2 border p-2 rounded-md border-gray-300"
              >
                <span className="font-semibold">{haircut?.name}</span>

                <select
                  value={
                    barberIds.find((b) => b.haircutId === haircutId)?.barberId || ""
                  }
                  onChange={(e) => handleBarberChange(haircutId, e.target.value)}
                  className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
                  required
                >
                  <option value="">Selecione o Profissional</option>
                  {availableBarbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <div className="flex flex-col">
            <label className="font-medium mb-1">Selecione a Data:</label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Escolha a data"
              minDate={new Date()}
              className="border px-3 py-2 rounded-md w-full border-gray-300"
            />
          </div>

          {/* 🕑 Seleção de Horário */}
          {availableHours.length > 0 && (
            <div className="flex flex-col">
              <label className="font-medium mb-1">Horários Disponíveis:</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="border px-3 py-2 rounded-md w-full border-gray-300"
                required
              >
                <option value="">Selecione um horário</option>
                {availableHours.map((hour) => (
                  <option key={hour.id} value={hour.time.split("T")[1].slice(0, 5)}>
                    {hour.time.split("T")[1].slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 📝 Descrição */}
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded-md border-gray-300"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          >
            Criar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
}
