import { NextRequest, NextResponse } from "next/server";
import { getCookieServer, getModuleCookieServer } from "./lib/cookieServer";
import { api } from "./services/api";


export async function middleware(req:NextRequest){
    const {pathname}=req.nextUrl
    if(pathname.startsWith("/_next")||pathname==="/"){
        
    return NextResponse.next()
    }

    const token = await getCookieServer()
    const tokenm=await getModuleCookieServer()
    
    if(pathname.startsWith("/dashboard")){
        if(!token){
        return NextResponse.redirect(new URL("/",req.url))
        }
        const isValid = await validateToken(token)
        if(!isValid){
            return NextResponse.redirect(new URL("/",req.url))
        }
    }

    if(pathname.startsWith("/modulo2") || pathname.startsWith("/modulo")){
        if(!tokenm){
        return NextResponse.redirect(new URL("/",req.url))
        }
        const isModuleValid = await validateModuleToken(tokenm)
        if(!isModuleValid){
            return NextResponse.redirect(new URL("/",req.url))
        }
    }
    return NextResponse.next()

}

async function validateToken(token:string){
    if(!token)return false

    try {
        await api.get("/me",{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

async function validateModuleToken(tokenm:string){
        if(!tokenm)return false

    try {
        await api.get("/phone/me",{
            headers:{
                Authorization: `Bearer ${tokenm}`
            }
        })
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

export const config = {
  matcher: [
    '/dashboard/(.*)',
    '/modulo',
    '/modulo2'
  ],
};