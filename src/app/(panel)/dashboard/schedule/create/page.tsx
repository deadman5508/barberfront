"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

interface Client {
  id: number;
  name: string;
  phone: string;
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
  const token = getCookieClient();

  const [clientPhone, setClientPhone] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [customer, setCustomer] = useState("");

  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [selectedHaircuts, setSelectedHaircuts] = useState<number[]>([]);

  const [barbers, setBarbers] = useState<{ haircutId: number; barbers: Barber[] }[]>([]);
  const [barberIds, setBarberIds] = useState<{ haircutId: number; barberId: string }[]>([]);

  const [availableHours, setAvailableHours] = useState<Hour[]>([]);
  const [selectedHour, setSelectedHour] = useState<string>("");

  // 🔍 Buscar cliente pelo telefone
  const handleSearchClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone) return;

    try {
      const response = await api.get("/clients", {
        params: { phone: clientPhone },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data) {
        toast.error("Cliente não encontrado.");
        setClient(null);
        setCustomer("");
        return;
      }

      setClient(response.data);
      const firstName = response.data.name.split(" ")[0];
      setCustomer(firstName);
      toast.success("Cliente encontrado!");
    } catch {
      toast.error("Erro ao buscar cliente.");
      setClient(null);
      setCustomer("");
    }
  };

  // 🔥 Carregar cortes
  useEffect(() => {
    async function loadHaircuts() {
      try {
        const response = await api.get("/haircuts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHaircuts(response.data);
      } catch {
        toast.error("Erro ao carregar cortes");
      }
    }
    loadHaircuts();
  }, [token]);

  // 🔍 Buscar barbeiros
  useEffect(() => {
    async function fetchBarbers() {
      const newBarbers: { haircutId: number; barbers: Barber[] }[] = [];

      for (const haircutId of selectedHaircuts) {
        try {
          const response = await api.get("/barber/byhaircut", {
            params: { haircut_id: haircutId },
            headers: { Authorization: `Bearer ${token}` },
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
  }, [selectedHaircuts, token]);

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
        const response = await api.get("/hours/me", {
          params: {
            barber_id: barberSelected,
            time: format(date, "yyyy-MM-dd"),
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvailableHours(response.data);
      } catch {
        toast.error("Erro ao buscar horários disponíveis.");
        setAvailableHours([]);
      }
    }

    fetchHours();
  }, [date, barberIds, token]);

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

    if (!client) {
      toast.error("Busque um cliente antes de agendar.");
      return;
    }

    if (!selectedHour) {
      toast.error("Selecione um horário disponível.");
      return;
    }

    try {
      await api.post(
        "/appointment",
        {
          name: `Agendamento ${customer}`,
          customer: customer,
          date: `${format(date as Date, "yyyy-MM-dd")}T${selectedHour}`,
          description,
          client_id: client.id,
          haircut_ids: selectedHaircuts,
          barber_ids: barberIds.map((b) => Number(b.barberId)),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Agendamento criado com sucesso!");

      setClient(null);
      setCustomer("");
      setClientPhone("");
      setDescription("");
      setDate(null);
      setSelectedHaircuts([]);
      setBarberIds([]);
      setBarbers([]);
      setSelectedHour("");
      setAvailableHours([]);
    } catch (error) {
      toast.error("Erro ao criar agendamento.");
    }
  };

  const haircutsTrue = haircuts.filter((cut) => cut.status === true);
  const haircutsFalse = haircuts.filter((cut) => cut.status === false);

  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white mb-20 container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm">
        {/* 🔍 Buscar Cliente */}
        <form onSubmit={handleSearchClient} className="flex-col flex w-full mb-4">
          <input
            type="text"
            placeholder="Telefone do Cliente"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="border px-3 py-2 mb-2 rounded-md w-full"
          />
          <button
            type="submit"
            className="p-2 border rounded-md hover:bg-pink-500 hover:text-white transition"
          >
            Buscar Cliente
          </button>
        </form>

        {/* ✅ Nome do Cliente */}
        <div className="mb-4">
          {client ? (
            <span className="font-semibold">Cliente: {customer}</span>
          ) : (
            <span className="text-gray-500">
              Consulte o cliente pelo telefone
            </span>
          )}
        </div>

        {/* 📅 Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-3">
          {/* ✅ Serviços Ativos */}
          <div className="flex flex-col gap-2">
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
          </div>

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

          {/* 🔥 Profissionais */}
          {selectedHaircuts.map((haircutId) => {
            const haircut = haircuts.find((cut) => cut.id === haircutId);
            const availableBarbers = barbers.find((b) => b.haircutId === haircutId)?.barbers || [];

            return (
              <div
                key={haircutId}
                className="flex flex-col gap-2 border p-2 rounded-md"
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
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          {/* 🕑 Seleção de Horário */}
          {availableHours.length > 0 && (
            <div className="flex flex-col">
              <label className="font-medium mb-1">Horários Disponíveis:</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
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
            className="border px-3 py-2 rounded-md"
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
