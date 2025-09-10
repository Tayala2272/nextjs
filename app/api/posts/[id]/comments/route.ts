import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post, { IPost, IComment } from '@/models/Post'
import { Types } from 'mongoose'

import * as Sentry from "@sentry/nextjs"

interface Params {
    params: {
        id: string
    }
}

// Dodawanie nowego komentarza do posta
export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { author, content } = await request.json()

        // Walidacja danych wejściowych
        if (!author || !content) {
            return NextResponse.json(
                { message: 'Autor i treść są wymagane' },
                { status: 400 }
            )
        }

        const { id } = await params
        const post: IPost | null = await Post.findById(id)
        
        // Sprawdzenie czy post istnieje
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        // Tworzenie nowego komentarza
        const newComment: IComment = {
            _id: new Types.ObjectId(),
            author,
            content,
            likes: 0,
            date: new Date()
        } as IComment

        // Dodanie komentarza do posta i zapisanie
        post.comments.push(newComment)
        await post.save()

        return NextResponse.json(newComment)
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas dodawania komentarza' },
            { status: 500 }
        )
    }
}