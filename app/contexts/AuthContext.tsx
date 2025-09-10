

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Interfejs dla danych użytkownika
    interface User {
        id: string
        username: string
    }

// Interfejs dla kontekstu autoryzacji
    interface AuthContextType {
        user: User | null
        login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
        register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
        logout: () => Promise<void>
        isLoading: boolean
    }

// Utworzenie kontekstu autoryzacji
    const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook do używania kontekstu autoryzacji
    export const useAuth = () => {
        const context = useContext(AuthContext)
        if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider')
        }
        return context
    }

// Props dla dostawcy autoryzacji
    interface AuthProviderProps {
        children: ReactNode
    }

// Główny komponent dostawcy autoryzacji
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()




    // Efekt sprawdzający stan logowania przy pierwszym renderowaniu
        useEffect(() => {
            const checkAuthStatus = async () => {
                try {
                    const response = await fetch('/api/auth/me', {
                        credentials: 'include'
                    })
                    
                    if (response.ok) {
                        const userData = await response.json()
                        setUser(userData)
                    }
                } catch (error) {
                    console.error('Błąd podczas weryfikacji statusu autoryzacji:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            checkAuthStatus()
        }, [])





    // Funkcja logująca użytkownika
        const login = async (username: string, password: string) => {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                })

                const data = await response.json()

                if (response.ok) {
                    setUser(data.user)
                    return { success: true }
                } else {
                    return { success: false, message: data.message }
                }
            } catch (error) {
                return { success: false, message: 'Wystąpił błąd podczas logowania' }
            }
        }

    // Funkcja rejestrująca nowego użytkownika
        const register = async (username: string, password: string) => {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                })

                const data = await response.json()

                if (response.ok) {
                    return { success: true, message: data.message }
                } else {
                    return { success: false, message: data.message }
                }
            } catch (error) {
                return { success: false, message: 'Wystąpił błąd podczas rejestracji' }
            }
        }

    // Funkcja wylogowująca użytkownika
        const logout = async () => {
            try {
                await fetch('/api/auth/logout', { 
                    method: 'POST',
                    credentials: 'include'
                })
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                setUser(null)
                router.push('/')
            }
        }

    // Wartość kontekstu
        const value = {
            user,
            login,
            register,
            logout,
            isLoading,
        }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}