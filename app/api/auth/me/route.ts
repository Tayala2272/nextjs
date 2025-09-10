

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'


const JWT_SECRET = process.env.JWT_SECRET as string


export async function GET(request: NextRequest) {
    try {
        await dbConnect()
        
        // Pobierz token z ciasteczka
            const token = request.cookies.get('token')?.value
            
            if (!token) {
                return NextResponse.json({ message: 'Brak tokenu' }, { status: 401 })
            }
        
        // Zweryfikuj token
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        
        // Znajdź użytkownika w bazie danych
            const user = await User.findById(decoded.userId)
            
            if (!user) {
                return NextResponse.json({ message: 'Użytkownik nie istnieje' }, { status: 404 })
            }
        
        // Zwróć dane użytkownika
            return NextResponse.json({
                id: user._id.toString(),
                username: user.username,
            })


            
    } catch (error) {
        return NextResponse.json({ message: 'Nieprawidłowy token' }, { status: 401 })
    }
}