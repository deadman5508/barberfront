import { cookies } from "next/headers";

export async function getCookieServer(){
    const token = (await cookies()).get("session")?.value
    return token || null
}

export async function getModuleCookieServer(){
    const tokenm = (await cookies()).get("msession")?.value
    return tokenm || null
}