import { getCookie } from "cookies-next";

export function getCookieClient(){
    const token = getCookie("session")
    return token
}

export function getModuleCookieClient(){
    const tokenm = getCookie("msession")
    return tokenm
}