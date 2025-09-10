


import mongoose, { Document, Schema } from 'mongoose'

export interface IComment extends Document {
    author: string
    content: string
    date: Date
    likes: number
}

export interface IPost extends Document {
    title: string
    content: string
    author: string
    date: Date
    tags: string[]
    likes: number
    comments: IComment[]
}

const CommentSchema: Schema = new Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    }
})

const PostSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    likes: {
        type: Number,
        default: 0
    },
    comments: [CommentSchema]
})

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)