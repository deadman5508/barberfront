"use client"
import Link from "next/link";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { LuLogOut } from "react-icons/lu";

export function Footer(){
    const router = useRouter()
    async function handleLogout(){
        deleteCookie("session",{path:"/"})
        router.replace('/')
    }
    return(
        <div className="fixed bottom-3 z-50 flex items-center justify-center w-full">
            <div className="container mx-auto flex items-center justify-around py-4 px-4 rounded-2xl bg-gray-100 border-t-2 border-t-gray-300">
                <Link href='/dashboard/schedule'> <span>Agendamentos</span> </Link>
                <Link href='/dashboard/schedule/client'> <span>Clientes</span> </Link>
                <Link href='/dashboard/schedule/account'> <span>Conta</span> </Link>
                <Link href='/dashboard/schedule/haircut'> <span>Cortes</span> </Link>
                <Link href=''> <span>Nfs</span> </Link>
                <button onClick={handleLogout}><LuLogOut /></button>
            </div>
        </div>
        
    )
}