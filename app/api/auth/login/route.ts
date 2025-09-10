


import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import * as Sentry from "@sentry/nextjs"

const JWT_SECRET = process.env.JWT_SECRET as string



export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        // Pobierz dane logowania z ciała żądania
            const { username, password } = await request.json()

        // Walidacja danych
            if (!username || !password) {
                return NextResponse.json(
                    { message: 'Nazwa użytkownika i hasło są wymagane' },
                    { status: 400 }
                )
            }

        // Znajdź użytkownika w bazie danych
            const user = await User.findOne({ username })
            if (!user) {
                return NextResponse.json(
                    { message: 'Nieprawidłowa nazwa użytkownika lub hasło' },
                    { status: 401 }
                )
            }

        // Sprawdź poprawność hasła
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return NextResponse.json(
                    { message: 'Nieprawidłowa nazwa użytkownika lub hasło' },
                    { status: 401 }
                )
            }

        // Generuj token JWT
            const token = jwt.sign(
                { userId: user._id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            )

        // Przygotuj dane użytkownika do zwrócenia
            const userData = {
                id: user._id.toString(),
                username: user.username,
            }

        // Utwórz odpowiedź z danymi użytkownika
            const response = NextResponse.json({
                message: 'Zalogowano pomyślnie',
                user: userData,
            })

        // Ustaw token w ciasteczku HTTP-only
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 dni
                path: '/',
            })

        return response
    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)
            
        return NextResponse.json(
            { message: 'Wystąpił błąd podczas logowania' },
            { status: 500 }
        )
    }
}