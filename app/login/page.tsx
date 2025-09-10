

'use client'
// trzeba zrobić po stronie klienta, bo jest przełącznik między ekranem logowania, a rejestrowania

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginPage() {

    // usteate do przełączania między logowaniem a rejestracją
        const [isLogin, setIsLogin] = useState(true)


    // var formularza
        const [formData, setFormData] = useState({
            username: '',
            password: '',
            confirmPassword: ''
        })

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Hooki do autoryzacji i routingu
        const { login, register } = useAuth()
        const router = useRouter()
    

    // Obsługa zmian w formularzu
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }

    // Obsługa submit formularza
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            setError('')
            setIsLoading(true)

            // Walidacja haseł przy rejestracji
                if (!isLogin && formData.password !== formData.confirmPassword) {
                    setError('Hasła nie są identyczne!')
                    setIsLoading(false)
                    return
                }

            try {
                let result
                
                if (isLogin) {
                    result = await login(formData.username, formData.password)
                } else {
                    result = await register(formData.username, formData.password)
                }

                if (result.success) {
                    if (isLogin) {
                        router.push('/')
                    } else {
                        alert('Konto zostało utworzone. Możesz się teraz zalogować.')
                        setIsLogin(true)
                        setFormData({ username: '', password: '', confirmPassword: '' })
                    }
                } else {
                    setError(result.message || 'Wystąpił nieznany błąd')
                }
            } catch (error) {
                setError('Wystąpił błąd podczas przetwarzania żądania')
            } finally {
                setIsLoading(false)
            }
        }

    return (
        <div className="app">
            <div className="auth-container">
                <div className="auth-header">
                    <h3>{isLogin ? 'Logowanie' : 'Rejestracja'}</h3>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Nazwa użytkownika</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            minLength={3}
                            maxLength={20}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Hasło</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Potwierdź hasło</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                            />
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="auth-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Ładowanie...' : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}
                    </button>
                </form>
                
                <div className="auth-switch">
                    <p>
                        {isLogin ? 'Nie masz jeszcze konta? ' : 'Masz już konto? '}
                        <span onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}