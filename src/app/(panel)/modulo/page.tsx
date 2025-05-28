"use client"
import { useState } from "react";
import DatePicker from "react-datepicker";

export default function Modulo() {
  const haircuts = [
  { id: 1, name: "Corte Tradicional" },
  { id: 2, name: "Barba" },
  { id: 3, name: "Corte + Barba" },
  { id: 4, name: "Sobrancelha" },
];
  const barbers = [
  { id: 1, name: "Pedro" },
  { id: 2, name: "Barbara" },
  { id: 3, name: "maria" },
  { id: 4, name: "Solange" },
];
  const hours = [
  { id: 1, name: "11:00" },
  { id: 2, name: "13:00" },
  { id: 3, name: "14:00" },
  { id: 4, name: "15:00" },
];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  //  Datas proibidas (exemplo: feriados ou indisponibilidades)
  const excludedDates = [
    new Date("2025-12-25"), // Natal
    new Date("2025-01-01"), // Ano Novo
  ];

  // Função para desabilitar domingos
  const isSunday = (date: Date) => date.getDay() === 0;

  return (
    <main className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm">
        <div className=" w-full">
          <h1>Bem-vindo sr(a) Renata </h1>
        </div>

        <div className="flex w-full ">

          <form action='' className="flex flex-col gap-4 w-full">

          <div>
            <legend className="flex w-full text-sm font-medium text-gray-700">
              Nome:
            </legend>
            <input
              type="text"
              id="customer"
              name="customer"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Digite o seu ou de quem será agendado"
              required
            />
          </div>

          <div >
            <legend className="block text-sm font-medium text-gray-700">
               Escolha o(s) Corte/serviço:
            </legend>
            {haircuts.map(haircut => (
               <label key={haircut.id} className="flex items-center space-x-2 space-y-2">
                <input
                  type="checkbox"
                  id={`haircut-${haircut.id}`}
                  name="haircuts[]"
                  value={haircut.id}
                  className="h-6 w-6 text-pink-500 border border-gray-300 focus:ring-pink-400"
                />
                <span className="text-sm text-gray-700">{haircut.name}</span>                </label>
            ))}
          </div>

          <div>
            <legend className="flex w-full text-sm font-medium text-gray-700">
              Profissional:
              </legend>
             <select
               id="haircut"
               name="haircut"
               className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
               required
             >
               <option value="">Selecione um profissional</option>
               {barbers.map(barber => (
                 <option key={barber.id} value={barber.id}>
                   {barber.name}
                 </option>
               ))}
             </select>
          </div>

          <div className="w-full">
            <legend className="block text-sm font-medium text-gray-700">
              Escolha a data do agendamento:
            </legend>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              excludeDates={excludedDates}
              filterDate={(date) => !isSunday(date)}
              dateFormat="dd/MM/yyyy"
              className="w-full border text-pink-500 border-gray-300 rounded-md px-3 py-2 "
              placeholderText="Selecione uma data"
              onFocus={(e) => e.target.blur()}
              calendarClassName="react-datepicker"
            />
            <legend>Não agendamos aos domingos e feriados,caso o faça seu agendamento será cancelado!</legend>
          </div>

          <div>
            <legend className="flex w-full text-sm font-medium text-gray-700">
              Horario:
              </legend>
             <select
               id="haircut"
               name="haircut"
               className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
               required
             >
               <option value="">Selecione um horario disponivel</option>
               {hours.map(hour => (
                 <option key={hour.id} value={hour.id}>
                   {hour.name}
                 </option>
               ))}
             </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
          >Entrar</button>
        </form>
        </div>
      </div>
    </main>
  );
}