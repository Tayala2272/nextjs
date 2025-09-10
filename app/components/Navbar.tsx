

'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import './navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout();
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    KosmicznaAplikacja
                </Link>
                
                <div className="nav-menu">
                    <Link href="/" className="nav-link">
                        Strona główna
                    </Link>
                    <Link href="/community" className="nav-link">
                        Społeczność
                    </Link>
                    
                    {user ? (
                        <>
                        <Link href="/account" className="nav-link">
                            Moje konto
                        </Link>
                        <button onClick={handleLogout} className="nav-link logout-btn">
                            Wyloguj
                        </button>
                        </>
                    ) : (
                        <Link href="/login" className="nav-link">
                        Zaloguj się
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}