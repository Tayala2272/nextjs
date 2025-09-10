import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post, { IPost } from '@/models/Post'

import * as Sentry from "@sentry/nextjs"

interface Params {
    params: {
        id: string
        commentId: string
    }
}

// Edycja komentarza
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { content } = await request.json()
        const { id, commentId } = await params
        const post: IPost | null = await Post.findById(id)

        // Sprawdzenie czy post istnieje
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        // Znalezienie komentarza po ID
        const commentIndex = post.comments.findIndex(
            (comment: any) => comment._id.toString() === commentId
        )

        // Sprawdzenie czy komentarz istnieje
        if (commentIndex === -1) {
            return NextResponse.json(
                { message: 'Komentarz nie znaleziony' },
                { status: 404 }
            )
        }

        // Aktualizacja treści komentarza i zapisanie
        post.comments[commentIndex].content = content
        await post.save()

        return NextResponse.json(post.comments[commentIndex])
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas aktualizacji komentarza' },
            { status: 500 }
        )
    }
}

// Usuwanie komentarza
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id, commentId } = await params
        const post: IPost | null = await Post.findById(id)

        // Sprawdzenie czy post istnieje
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        // Filtrowanie komentarzy - usunięcie komentarza o podanym ID
        post.comments = post.comments.filter(
            (comment: any) => comment._id.toString() !== commentId
        )

        // Zapisanie zmian
        await post.save()

        return NextResponse.json({ message: 'Komentarz usunięty pomyślnie' })
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas usuwania komentarza' },
            { status: 500 }
        )
    }
}

// Dodawanie polubienia do komentarza
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id, commentId } = await params
        const post: IPost | null = await Post.findById(id)

        // Sprawdzenie czy post istnieje
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        // Znalezienie komentarza po ID
        const commentIndex = post.comments.findIndex(
            (comment: any) => comment._id.toString() === commentId
        )

        // Sprawdzenie czy komentarz istnieje
        if (commentIndex === -1) {
            return NextResponse.json(
                { message: 'Komentarz nie znaleziony' },
                { status: 404 }
            )
        }

        // Zwiększenie liczby polubień i zapisanie
        post.comments[commentIndex].likes += 1
        await post.save()

        return NextResponse.json(post.comments[commentIndex])
    } catch (error) {


        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas dodawania polubienia' },
            { status: 500 }
        )
    }
}