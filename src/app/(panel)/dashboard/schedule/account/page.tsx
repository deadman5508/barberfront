"use client"

import { getCookieClient } from "@/lib/cookieClient";
import { api } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";


interface User{
  name:string
  document:string
  docState?:string
  address:string
  cep:string
  email:string
}

export default function Account() {
    const token=getCookieClient()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)


  useEffect(() => {
    async function userMe() {
      try {
          const response = await api.get('/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data)
          setUser(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    userMe();
  }, [token]);
  return (
    <div className="flex flex-col rounded-md items-center justify-center mx-auto min-h-screen">
      <div className="bg-white container flex flex-col p-6 rounded-xl shadow-md w-full items-center justify-center max-w-sm mb-20">
        <div className="w-full flex justify-end gap-2">
          <Link href='/dashboard/schedule/barber'><button className="p-2 hover:bg-pink-500 hover:text-white transition border border-gray-300 rounded-md">Colaboradores</button></Link>
          <Link href='/dashboard/schedule/hour'><button className="p-2 hover:bg-pink-500 hover:text-white transition border border-gray-300 rounded-md">Horarios</button></Link>
        </div>
        {loading ? (
          <p>Carregando...</p>
        ) : user ? (
          <div className="flex flex-col w-full items-center justify-center">

            <div className="w-full">
              <div className="w-full">

                <div>
                  <div>
                    <span className="text-gray-700">CNPJ:</span>
                  </div>
                  <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                    {user.document}
                  </div>
                </div>
                {user.docState && (
                  <div>
                    <div>
                      <span className="text-gray-700">Inscricao Estudual:</span>
                    </div>
                    <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                      {user.docState}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-700">Name:</span>
                </div>
                <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                  {user.name}
                </div>
              </div>

                <div>
                  <div>
                    <span className="text-gray-700">Endereço:</span>
                  </div>
                  <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                    {user.address}
                  </div>
                </div>               

                <div>
                  <div>
                    <span className="text-gray-700">Cep:</span>
                  </div>
                  <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                    {user.cep}
                  </div>
                </div>               

                <div>
                  <div>
                    <span className="text-gray-700">Email:</span>
                  </div>
                  <div className="border border-gray-300 px-3 py-2 rounded-md w-full">
                    {user.email}
                  </div>
                </div>

            </div>
          </div>
        ) : (
          <h1>Usuário não autenticado</h1>
        )}
      </div>
    </div>
  );
}