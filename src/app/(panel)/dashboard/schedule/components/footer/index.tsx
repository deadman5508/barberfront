"use client"
import Link from "next/link";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { LuCalendarClock, LuFileText, LuLogOut, LuScissors, LuUserCog, LuUsers } from "react-icons/lu";

export function Footer(){
    const router = useRouter()
    async function handleLogout(){
        deleteCookie("session",{path:"/"})
        router.replace('/')
    }
    return(
        <div className="fixed bottom-3 z-50 flex items-center justify-center w-full">
            <div className="container mx-auto flex items-center justify-around px-4 rounded-2xl bg-gray-100 border-t-2 border-t-gray-300">
                <Link href='/dashboard/schedule' className="p-4"> <span><LuCalendarClock size={30}/></span> </Link>
                <Link href='/dashboard/schedule/client' className="py-4 px-2"> <span><LuUsers size={30}/></span> </Link>
                <Link href='/dashboard/schedule/account' className="py-4 px-2"> <span><LuUserCog size={30}/></span> </Link>
                <Link href='/dashboard/schedule/haircut' className="py-4 px-2"> <span><LuScissors size={30}/></span> </Link>
                <Link href='' className="py-4 px-2"> <span><LuFileText size={30}/></span> </Link>
                <button onClick={handleLogout}><LuLogOut size={30}/></button>
            </div>
        </div>
        
    )
}