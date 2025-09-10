import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Post, { IPost } from '@/models/Post'

import * as Sentry from "@sentry/nextjs"

export async function GET(): Promise<NextResponse> {
    try {
        await dbConnect()
        const posts: IPost[] = await Post.find().sort({ date: -1 })
        return NextResponse.json(posts)
    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas pobierania postów' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect()
        const { title, content, author, tags } = await request.json()

        if (!title || !content || !author) {
            return NextResponse.json(
                { message: 'Tytuł, treść i autor są wymagane' },
                { status: 400 }
            )
        }

        const newPost: IPost = new Post({
            title,
            content,
            author,
            tags: tags || [],
            likes: 0,
            comments: []
        })

        await newPost.save()
        return NextResponse.json(newPost)
    } catch (error) {

        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)

        return NextResponse.json(
            { message: 'Błąd podczas tworzenia posta' },
            { status: 500 }
        )
    }
}