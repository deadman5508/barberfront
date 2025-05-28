"use client";

import { getCookieClient } from "@/lib/cookieClient";
import Link from "next/link";
import {useState} from "react";
import DatePicker from "react-datepicker";
import { LuSearch } from "react-icons/lu";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/services/api";

interface ScheduleProps {
  id: string;
  name: string;
  customer: string;
  phone: string;
  date: string;
  description: string;
  total:number;
  appointmentBarbers:[
      {
        barber: {
        id: number;
        name: string;
        phone:string;
    }}]
  
  haircut: {
    name: string;
    price: number;
  };
  client: {
    name: string;
  };
}

export default function Schedule() {
  const token = getCookieClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [schedule, setSchedule] = useState<ScheduleProps[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<ScheduleProps[]>(
    []
  );

  const handleFilterDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      const response = await api.get('/appointment/me',
        {
          params: {
            date: selectedDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedule(response.data);
      setFilteredSchedule(response.data); // Começa com todos os dados da data
    } catch (err) {
      console.log("Erro ao buscar agendamentos", err);
    }
  };

  const handleFilterPhone = (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneFilter.trim() === "") {
      setFilteredSchedule(schedule); // Se vazio, volta todos
      return;
    }

    const result = schedule.filter(
      (item) =>
        item.appointmentBarbers.map((barberItem) => barberItem.barber.phone).includes(phoneFilter)|| item.customer.includes(phoneFilter)
    );

    setFilteredSchedule(result);
  };

  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white mb-20 container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm">
        <div className="flex flex-row gap-2 items-center mb-4">
          <h1 className="text-xl">Agenda</h1>
          <Link
            href="/dashboard/schedule/create"
            className="bg-pink-600 text-white px-2 py-1 rounded-md"
          >
            Registrar
          </Link>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <h2 className="text-left text-sm font-semibold">Filtrar:</h2>

          {/* Filtro por Data */}
          <form
            onSubmit={handleFilterDate}
            className="flex gap-2 items-center"
          >
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Data"
              className="border text-pink-500 border-gray-300 rounded-md px-3 py-2"
              calendarClassName="react-datepicker"
              dateFormat="dd/MM/yyyy"
            />
            <button
              type="submit"
              className="bg-pink-600 p-2 rounded-md text-white hover:brightness-90"
            >
              <LuSearch size={18} />
            </button>
          </form>

          {/* Filtro por Telefone */}
          <form
            onSubmit={handleFilterPhone}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Telefone Colaborador"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-2 w-full"
            />
            <button
              type="submit"
              className="bg-pink-600 p-2 rounded-md text-white hover:brightness-90"
            >
              <LuSearch size={18} />
            </button>
          </form>
        </div>

        <div className="border border-gray-300 mt-4 w-full rounded-md p-2">
          <span className="font-semibold">Agendamentos:</span>

          {filteredSchedule.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Nenhum agendamento encontrado.
            </p>
          )}

          {filteredSchedule.map((item) => (
            <div
              key={item.id}
              className="w-full bg-gray-50 rounded-md p-2 mt-2"
            >
              <p className="text-sm">
                <span className="font-semibold">Cliente:</span>{" "}
                {item.customer}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Colaborador:</span>{" "}
                {item.appointmentBarbers.map((barberItem) => barberItem.barber.name).join(', ')}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Total:</span>{" "}
                {item.total}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Serviço:</span>{" "}
                {item.haircut?.name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Data:</span>{" "}
                {new Date(item.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour:"2-digit",
                  minute:"2-digit"
                })}
              </p>
              {item.description && (
                <p className="text-sm">
                  <span className="font-semibold">Observação:</span>{" "}
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
