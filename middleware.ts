

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)



// Ścieżki chronione wymagające autoryzacji
    const protectedRoutes = ['/account']



export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

    if (isProtectedRoute) {
        // Pobierz token z ciasteczka
            const token = request.cookies.get('token')?.value
            
            if (!token) {
                return NextResponse.redirect(new URL('/login', request.url))
            }
            
            try {
                // Zweryfikuj token JWT
                jwtVerify(token, JWT_SECRET)
                return NextResponse.next()
            } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // wykluczamy te ścieżki z weryfikacji
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}