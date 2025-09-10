

'use client'

import { useAuth } from '@/contexts/AuthContext'
import './account.css'

export default function AccountPage() {
    const { user, logout } = useAuth()

    // Funkcja obsługująca wylogowanie
        const handleLogout = () => {
            logout()
        }

    // Funkcja obsługująca usuwanie konta
        const handleDeleteAccount = async () => {
            if (confirm('Czy na pewno chcesz usunąć konto? Tej operacji nie można cofnąć.')) {
                try {
                    const response = await fetch('/api/auth/delete', {
                        method: 'DELETE',
                        credentials: 'include'
                    })

                    if (response.ok) {
                        alert('Konto zostało usunięte')
                        logout()
                    } else {
                        alert('Wystąpił błąd podczas usuwania konta')
                    }
                } catch (error) {
                    alert('Wystąpił błąd podczas usuwania konta')
                }
            }
        }



    // Jeśli użytkownik nie jest zalogowany, wyświetl komunikat
        if (!user) {
            return (
                <div className="app">
                    <div className="auth-container">
                        <p>Musisz być zalogowany, aby zobaczyć tę stronę.</p>
                    </div>
                </div>
            )
        }

    return (
        <div className="app">
            <div className="account-container">
                <h3>Twoje konto</h3>
                
                <div className="profile-header">
                    <div className="profile-avatar">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#4a6fa5" />
                            <circle cx="50" cy="40" r="20" fill="white" />
                            <path d="M30 85C30 70 40 65 50 65C60 65 70 70 70 85" fill="white" />
                        </svg>
                    </div>
                    <h2>{user.username}</h2>
                </div>
                
                <div className="account-info">
                    <div className="info-section">
                        <h4>Dane konta</h4>
                        <div className="info-item">
                            <span>Nazwa użytkownika:</span>
                            <span>{user.username}</span>
                        </div>
                    </div>
                </div>
                
                <div className="account-actions">
                    <button onClick={handleLogout} className="logout-btn">
                        Wyloguj się
                    </button>
                    <button onClick={handleDeleteAccount} className="delete-btn">
                        Usuń konto
                    </button>
                </div>
            </div>
        </div>
    )
}