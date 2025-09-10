

import { NextResponse } from 'next/server'

export async function POST() {
    // Utwórz odpowiedź z komunikatem o wylogowaniu
        const response = NextResponse.json({ message: 'Wylogowano pomyślnie' })
    
    // Wyczyść ciasteczko z tokenem
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        })

    return response
}