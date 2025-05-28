import { Header } from "../_components/header/header"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { api } from "@/services/api"





export default function Home() {
  
  async function handleLogin(formData: FormData) {
  'use server'
  const phone = formData.get('phone')
  try {
    const response = await api.post('/phone', { phone })
    const tokenm = response.data.tokenM

    const oneHour = 60 * 60
    ;(await cookies()).set('msession',tokenm, {
      maxAge: oneHour,
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === "production"
    })

  } catch (err) {
    console.log(err)
    return
  }

  redirect('/modulo')
}


async function accessWithoutRegister() {
  'use server'

  const modulov =11999999999
  try {
    const response = await api.post('/phone', { modulov })
    const tokenm = response.data.tokenM

    const oneHour = 60 * 60
    ;(await cookies()).set('msession',tokenm, {
      maxAge: oneHour,
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === "production"
    })

  } catch (err) {
    console.log(err)
  }

  redirect('/modulo2')
}
  return (
    <div className="flex flex-col rounded-md items-center justify-center container mx-auto min-h-screen">
      <Header />
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-800">Elizeu</h1>
          <h2 className="text-xl text-pink-600">Cabeleleiro</h2>
          
        </div>
        <h3 className="">Faça seu agendamento aqui!</h3>
        <div>
          
          <form action={handleLogin} className="flex flex-col gap-4">
          <div>
            <legend className="block text-sm font-medium text-gray-700">
              Telefone:
            </legend>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="(79) 99843-1776"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            Entrar
          </button>
        </form>
        </div>

        <div className="mt-6">
            <form action={accessWithoutRegister}>
              <button type="submit" className="p-2 border  rounded-md w-full border-gray-300 text-sm text-pink-700 hover:underline">
                Agendamento sem cadastro <span className="font-semibold">clique aqui</span>
              </button>
            </form>
        </div>
      </div>
    </div>
  )
}
