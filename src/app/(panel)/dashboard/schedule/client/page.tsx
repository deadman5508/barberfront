"use client";

import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useState } from "react";
import { LuPencil, LuSearch, LuSave, LuX } from "react-icons/lu";

interface requestClients {
  id: number;
  name: string;
  address: string;
  cep: string;
  document: string;
  phone: string;
  user_id: number;
  birthday?: Date;
}

export default function Client() {
  const token = getCookieClient();

  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<requestClients | null>(null);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");

  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<requestClients>>({});

  async function searchByPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneFilter) return;

    setLoading(true);
    try {
      const response = await api.get("/clients", {
        params: { phone: phoneFilter },
        headers: { Authorization: `Bearer ${token}` },
      });
      setClient(response.data);
    } catch (error) {
      console.error("Erro ao buscar por telefone:", error);
      setClient(null);
    } finally {
      setLoading(false);
    }
  }

  async function searchByCpf(e: React.FormEvent) {
    e.preventDefault();
    if (!cpfFilter) return;

    setLoading(true);
    try {
      const response = await api.get("/clients", {
        params: { cpf: cpfFilter },
        headers: { Authorization: `Bearer ${token}` },
      });
      setClient(response.data);
    } catch (error) {
      console.error("Erro ao buscar por CPF:", error);
      setClient(null);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(client: requestClients) {
    setEditClientId(client.id);
    setEditData({ ...client });
  }

  function handleCancel() {
    setEditClientId(null);
    setEditData({});
  }

  async function handleSave() {
    try {
      const response = await api.put(
        `/clients/${editClientId}`,
        {
          ...editData,
          birthday: editData.birthday ? new Date(editData.birthday) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClient(response.data);
      handleCancel();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  }

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof requestClients
  ) {
    setEditData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }

  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="flex flex-col gap-4 mb-4 w-full">
          <div className="flex w-full justify-end">
            <Link href="/dashboard/schedule/client/create">
              <button className="border border-gray-300 px-3 py-2 rounded-md hover:bg-pink-500 hover:text-white transition">
                Adicionar
              </button>
            </Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <h1>Clientes</h1>
          </div>

          <form onSubmit={searchByPhone} className="flex gap-2">
            <input
              type="text"
              placeholder="Telefone"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-3 w-full"
            />
            <button
              type="submit"
              className="p-2 border rounded-md   hover:bg-pink-500 hover:text-white transition "
            >
              <LuSearch size={25}/>
            </button>
          </form>

          <form onSubmit={searchByCpf} className="flex gap-2">
            <input
              type="text"
              placeholder="CPF"
              value={cpfFilter}
              onChange={(e) => setCpfFilter(e.target.value)}
              className="text-pink-500 border rounded-md border-gray-300 px-3 py-3 w-full"
            />
            <button
              type="submit"
              className="p-2 border rounded-md hover:bg-pink-500 hover:text-white transition "
            >
              <LuSearch size={25}/>
            </button>
          </form>

          <button
            onClick={() => {
              setClient(null);
              setPhoneFilter("");
              setCpfFilter("");
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            Limpar resultados
          </button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : client ? (
          <div className="border gap-2 border-gray-300 rounded-md p-2 shadow-sm flex flex-col w-full">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">{client.name}</h2>
              {editClientId === client.id ? (
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
                  onClick={() => handleEdit(client)}
                  className="border rounded-full p-1 hover:bg-pink-500 hover:text-white"
                >
                  <LuPencil />
                </button>
              )}
            </div>

            {editClientId === client.id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => handleChangeInput(e, "name")}
                  className="border rounded px-2 py-1"
                  placeholder="Nome"
                />
                <input
                  type="text"
                  value={editData.phone || ""}
                  onChange={(e) => handleChangeInput(e, "phone")}
                  className="border rounded px-2 py-1"
                  placeholder="Telefone"
                />
                <input
                  type="text"
                  value={editData.document || ""}
                  onChange={(e) => handleChangeInput(e, "document")}
                  className="border rounded px-2 py-1"
                  placeholder="CPF"
                />
                <input
                  type="text"
                  value={editData.address || ""}
                  onChange={(e) => handleChangeInput(e, "address")}
                  className="border rounded px-2 py-1"
                  placeholder="Endereço"
                />
                <input
                  type="text"
                  value={editData.cep || ""}
                  onChange={(e) => handleChangeInput(e, "cep")}
                  className="border rounded px-2 py-1"
                  placeholder="CEP"
                />
                <input
                  type="date"
                  value={
                    editData.birthday
                      ? new Date(editData.birthday).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleChangeInput(e, "birthday")}
                  className="border rounded px-2 py-1"
                />
              </div>
            ) : (
              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-medium">Telefone:</span> {client.phone}
                </p>
                <p>
                  <span className="font-medium">CPF:</span> {client.document}
                </p>
                {client.address && (
                  <p>
                    <span className="font-medium">Endereço:</span>{" "}
                    {client.address}
                  </p>
                )}
                {client.cep && (
                  <p>
                    <span className="font-medium">CEP:</span> {client.cep}
                  </p>
                )}
                {client.birthday && (
                  <p>
                    <span className="font-medium">Aniversário:</span>{" "}
                    {new Date(client.birthday).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-center text-gray-500">
            Nenhum cliente encontrado
          </h1>
        )}
      </div>
    </div>
  );
}
