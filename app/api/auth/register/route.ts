

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

import * as Sentry from "@sentry/nextjs"

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        // Pobierz dane rejestracji z ciała żądania
            const { username, password } = await request.json()

        // Walidacja danych
            if (!username || !password) {
                return NextResponse.json(
                    { message: 'Nazwa użytkownika i hasło są wymagane' },
                    { status: 400 }
                )
            }
            if (username.length < 3 || username.length > 20) {
                return NextResponse.json(
                    { message: 'Nazwa użytkownika musi mieć od 3 do 20 znaków' },
                    { status: 400 }
                )
            }
            if (password.length < 6) {
                return NextResponse.json(
                    { message: 'Hasło musi mieć co najmniej 6 znaków' },
                    { status: 400 }
                )
            }

        // Sprawdź czy użytkownik już istnieje
            const existingUser = await User.findOne({ username })
            if (existingUser) {
                return NextResponse.json(
                    { message: 'Użytkownik o tej nazwie już istnieje' },
                    { status: 400 }
                )
            }

        // Hashowanie hasła przed zapisaniem do bazy
            const hashedPassword = await bcrypt.hash(password, 12)

        // Tworzenie nowego użytkownika
            const user = await User.create({
                username,
                password: hashedPassword,
            })

        return NextResponse.json(
            { message: 'Konto zostało utworzone pomyślnie' },
            { status: 201 }
        )
    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)
            
        return NextResponse.json(
            { message: 'Wystąpił błąd podczas rejestracji' },
            { status: 500 }
        )
    }
}