import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post, { IPost } from '@/models/Post'

import * as Sentry from "@sentry/nextjs"

interface Params {
    params: {
        id: string
    }
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id } = await params
        const post: IPost | null = await Post.findById(id)
        
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        return NextResponse.json(post)
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas pobierania posta' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id } = await params
        const { title, content, tags } = await request.json()
        const updatedPost: IPost | null = await Post.findByIdAndUpdate(
            id,
            { title, content, tags },
            { new: true }
        )

        if (!updatedPost) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedPost)
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas aktualizacji posta' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id } = await params
        const deletedPost: IPost | null = await Post.findByIdAndDelete(id)
        
        if (!deletedPost) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        return NextResponse.json({ message: 'Post usunięty pomyślnie' })
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas usuwania posta' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        await dbConnect()
        const { id } = await params
        const post: IPost | null = await Post.findById(id)
        
        if (!post) {
            return NextResponse.json(
                { message: 'Post nie znaleziony' },
                { status: 404 }
            )
        }

        post.likes += 1
        await post.save()

        return NextResponse.json(post)
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