import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { api } from "@/services/api"
import { Header } from "@/app/_components/header/header"
import Link from "next/link"
import { LuArrowLeft } from "react-icons/lu"
import { getCookieServer } from "@/lib/cookieServer"


export async function handleLogin(formData: FormData) {
  'use server'
  const email = formData.get('email')
  const password = formData.get('password')
  try {
    const response = await api.post('/session', { email,password })
    const token = response.data.token

    const oneHour = 60 * 60 * 24 * 30 * 1000;
    (await cookies()).set('session',token, {
      maxAge: oneHour,
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === "production"
    })

  } catch (err) {
    console.log(err)
    return
  }
  redirect('/dashboard/schedule')
}



export default async function Dashboard() {
  const token = await getCookieServer()

  if (token) {
    redirect('/dashboard/schedule')
  }

  return (
    <div className="flex flex-col rounded-md items-center justify-center container mx-auto min-h-screen">
      <Header/>
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <div>
          <Link href='/' className=" border border-gray-300 items-center justify-center flex w-fit gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"><LuArrowLeft/>voltar</Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-800">Elizeu</h1>
          <h2 className="text-xl text-pink-600">Cabeleleiro</h2>
        </div>

        <div>
          <form action={handleLogin} className="flex flex-col gap-4">
          <div>
            <legend className="block text-sm font-medium text-gray-700">
              Email:
            </legend>
            <input
              type="text"
              id="email"
              name="email"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="lucas@gmail.com"
              required
            />
          </div>
            <div>
              <legend className="block text-sm font-medium text-gray-700">
                Senha:
              </legend>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="*******"
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
      </div>
    </div>
  )
}

