'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import './community.css'

interface Post {
    _id: string
    title: string
    content: string
    author: string
    date: string
    tags: string[]
    likes: number
    comments: Comment[]
}

interface Comment {
    _id: string
    author: string
    content: string
    date: string
    likes: number
}

export default function CommunityPage() {
    const { user } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' })
    const [showNewPostForm, setShowNewPostForm] = useState(false)
    const [activeTags, setActiveTags] = useState<string[]>([])
    const [sortBy, setSortBy] = useState<'date' | 'likes' | 'comments'>('date')
    const [editingComment, setEditingComment] = useState<{postId: string, commentId: string, content: string} | null>(null)
    const [replyingTo, setReplyingTo] = useState<{postId: string, commentId: string} | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const allTags = ['Astronomia', 'Rakiety', 'Misje kosmiczne', 'NASA', 'SpaceX', 'ISS', 'Teleskopy', 'Planety']

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/posts')
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania postów')
                }
                const data = await response.json()
                setPosts(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [])

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) return
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newPost.title,
                    content: newPost.content,
                    author: user?.username || 'Anonim',
                    tags: newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()) : []
                })
            })

            if (!response.ok) {
                throw new Error('Błąd podczas tworzenia posta')
            }

            const createdPost = await response.json()
            // Zabezpieczenie przed brakującymi tagami
            createdPost.tags = createdPost.tags || []
            setPosts([createdPost, ...posts])
            setNewPost({ title: '', content: '', tags: '' })
            setShowNewPostForm(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleEditPost = async (postId: string, updatedContent: Partial<Post>) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedContent)
            })

            if (!response.ok) {
                throw new Error('Błąd podczas edycji posta')
            }

            const updatedPost = await response.json()
            // Zabezpieczenie przed brakującymi tagami
            updatedPost.tags = updatedPost.tags || []
            setPosts(posts.map(post => 
                post._id === postId ? updatedPost : post
            ))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleDeletePost = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Błąd podczas usuwania posta')
            }

            setPosts(posts.filter(post => post._id !== postId))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleLikePost = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PATCH'
            })

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania polubienia')
            }

            const updatedPost = await response.json()
            // Zabezpieczenie przed brakującymi tagami
            updatedPost.tags = updatedPost.tags || []
            setPosts(posts.map(post => 
                post._id === postId ? updatedPost : post
            ))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleAddComment = async (postId: string, content: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    author: user?.username || 'Anonim',
                    content
                })
            })

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania komentarza')
            }

            const newComment = await response.json()
            // Aktualizujemy stan, dodając nowy komentarz do posta
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, newComment]
                    }
                }
                return post
            }))
            setReplyingTo(null)
            setReplyContent('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleEditComment = async (postId: string, commentId: string, content: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            })

            if (!response.ok) {
                throw new Error('Błąd podczas edycji komentarza')
            }

            const updatedComment = await response.json()
            // Aktualizujemy stan, zastępując edytowany komentarz
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: post.comments.map(comment => 
                            comment._id === commentId ? updatedComment : comment
                        )
                    }
                }
                return post
            }))
            setEditingComment(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleDeleteComment = async (postId: string, commentId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Błąd podczas usuwania komentarza')
            }

            // Aktualizujemy stan, usuwając komentarz z posta
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(comment => comment._id !== commentId)
                    }
                }
                return post
            }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const handleLikeComment = async (postId: string, commentId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PATCH'
            })

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania polubienia komentarza')
            }

            const updatedComment = await response.json()
            // Aktualizujemy stan, zastępując polubiony komentarz
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: post.comments.map(comment => 
                            comment._id === commentId ? updatedComment : comment
                        )
                    }
                }
                return post
            }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd')
        }
    }

    const filteredPosts = activeTags.length > 0 
        ? posts.filter(post => post.tags && post.tags.some(tag => activeTags.includes(tag)))
        : posts

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        } else if (sortBy === 'likes') {
            return b.likes - a.likes
        } else {
            return (b.comments?.length || 0) - (a.comments?.length || 0)
        }
    })

    if (loading) return <div className="app">Ładowanie...</div>
    if (error) return <div className="app">Błąd: {error}</div>

    return (
        <div className="app">
            <div className="community-container">
                <h3>Społeczność Kosmicznych Entuzjastów</h3>
                
                {error && <div className="error-message">{error}</div>}

                <div className="community-controls">
                    <div className="tags-filter">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                className={`tag ${activeTags.includes(tag) ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTags(prev => 
                                        prev.includes(tag) 
                                            ? prev.filter(t => t !== tag) 
                                            : [...prev, tag]
                                    )
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="community-actions">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="sort-select"
                        >
                            <option value="date">Sortuj według daty</option>
                            <option value="likes">Sortuj według polubień</option>
                            <option value="comments">Sortuj według komentarzy</option>
                        </select>
                        
                        <button 
                            className="new-post-button"
                            onClick={() => setShowNewPostForm(!showNewPostForm)}
                        >
                            {showNewPostForm ? 'Anuluj' : 'Nowy post'}
                        </button>
                    </div>
                </div>
                
                {showNewPostForm && (
                    <div className="new-post-form">
                        <h4>Utwórz nowy post</h4>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tytuł posta"
                                value={newPost.title}
                                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Treść posta"
                                value={newPost.content}
                                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                rows={4}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tagi (oddzielone przecinkami)"
                                value={newPost.tags}
                                onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                            />
                        </div>
                        <div className="form-actions">
                            <button onClick={handleCreatePost}>Opublikuj</button>
                            <button onClick={() => setShowNewPostForm(false)}>Anuluj</button>
                        </div>
                    </div>
                )}
                
                <div className="posts-list">
                    {sortedPosts.map(post => (
                        <div key={post._id} className="post-item">
                            <div className="post-header">
                                <div className="post-title-section">
                                    <h4>{post.title}</h4>
                                    {user?.username === post.author && (
                                        <div className="post-actions-menu">
                                            <button 
                                                onClick={() => handleEditPost(post._id, { 
                                                    title: prompt('Nowy tytuł:', post.title) || post.title,
                                                    content: prompt('Nowa treść:', post.content) || post.content
                                                })}
                                                className="edit-btn"
                                            >
                                                Edytuj
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (confirm('Czy na pewno chcesz usunąć ten post?')) {
                                                        handleDeletePost(post._id)
                                                    }
                                                }}
                                                className="delete-btn"
                                            >
                                                Usuń
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="post-meta">
                                    <span className="author">@{post.author}</span>
                                    <span className="date">{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="post-content">
                                <p>{post.content}</p>
                            </div>
                            
                            <div className="post-tags">
                                {post.tags && post.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            
                            <div className="post-actions">
                                <button 
                                    className="like-btn"
                                    onClick={() => handleLikePost(post._id)}
                                >
                                    👍 {post.likes}
                                </button>
                                <button 
                                    className="comment-btn"
                                    onClick={() => setReplyingTo(replyingTo?.postId === post._id ? null : { postId: post._id, commentId: '' })}
                                >
                                    💬 {post.comments?.length || 0}
                                </button>
                            </div>
                            
                            {post.comments && post.comments.length > 0 && (
                                <div className="comments-section">
                                    {post.comments.map(comment => (
                                        <div key={comment._id} className="comment">
                                            <div className="comment-header">
                                                <span className="author">@{comment.author}</span>
                                                <div className="comment-actions">
                                                    <span className="date">{new Date(comment.date).toLocaleDateString()}</span>
                                                    {user?.username === comment.author && (
                                                        <>
                                                            <button 
                                                                onClick={() => setEditingComment(
                                                                    editingComment?.commentId === comment._id 
                                                                        ? null 
                                                                        : { postId: post._id, commentId: comment._id, content: comment.content }
                                                                )}
                                                                className="edit-btn"
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    if (confirm('Czy na pewno chcesz usunąć ten komentarz?')) {
                                                                        handleDeleteComment(post._id, comment._id)
                                                                    }
                                                                }}
                                                                className="delete-btn"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {editingComment?.commentId === comment._id ? (
                                                <div className="edit-comment">
                                                    <textarea
                                                        value={editingComment.content}
                                                        onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
                                                        rows={3}
                                                    />
                                                    <div className="edit-actions">
                                                        <button onClick={() => handleEditComment(post._id, comment._id, editingComment.content)}>
                                                            Zapisz
                                                        </button>
                                                        <button onClick={() => setEditingComment(null)}>
                                                            Anuluj
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>{comment.content}</p>
                                            )}
                                            <div className="comment-actions">
                                                <button 
                                                    className="like-btn"
                                                    onClick={() => handleLikeComment(post._id, comment._id)}
                                                >
                                                    👍 {comment.likes}
                                                </button>
                                                <button 
                                                    className="reply-btn"
                                                    onClick={() => setReplyingTo(
                                                        replyingTo?.commentId === comment._id 
                                                            ? null 
                                                            : { postId: post._id, commentId: comment._id }
                                                    )}
                                                >
                                                    Odpowiedz
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {(replyingTo?.postId === post._id) && (
                                <div className="add-comment">
                                    <textarea 
                                        placeholder={replyingTo.commentId ? "Odpowiedz na komentarz..." : "Dodaj komentarz..."}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="comment-actions">
                                        <button onClick={() => handleAddComment(post._id, replyContent)}>
                                            {replyingTo.commentId ? 'Odpowiedz' : 'Dodaj'}
                                        </button>
                                        <button onClick={() => {
                                            setReplyingTo(null)
                                            setReplyContent('')
                                        }}>
                                            Anuluj
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}