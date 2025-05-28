import Link from "next/link";
import { LuLockKeyhole } from "react-icons/lu";

export function Header(){
    return(
        <div className="fixed top-0 right-0 left-0 z-50">
            <div className="container mx-auto flex items-center justify-end py-4 px-4">
                <Link href='/dashboard' className="flex text-lg flex-row justify-end items-center gap-2 text-pink-700 hover:text-pink-300 transition-colors">
                     Login
                     <LuLockKeyhole /> 
                </Link>
            </div>
        </div>
    )
}