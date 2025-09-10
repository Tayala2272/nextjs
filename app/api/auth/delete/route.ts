

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

import * as Sentry from "@sentry/nextjs"

const JWT_SECRET = process.env.JWT_SECRET as string

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect()

        // Pobierz token z ciasteczka
            const token = request.cookies.get('token')?.value
            
            if (!token) {
                return NextResponse.json(
                    { message: 'Brak tokenu autoryzacyjnego' },
                    { status: 401 }
                )
            }

        // Zweryfikuj token JWT
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
            const userId = decoded.userId

        // Usuń użytkownika z bazy danych
            await User.findByIdAndDelete(userId)

        // Utwórz odpowiedź i wyczyść ciasteczko
            const response = NextResponse.json(
                { message: 'Konto zostało usunięte' },
                { status: 200 }
            )

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        })

        return response
    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)
            
        return NextResponse.json(
            { message: 'Wystąpił błąd podczas usuwania konta' },
            { status: 500 }
        )
    }
}