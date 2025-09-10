
'use client'

import './clock.css'
import { useEffect, useState } from 'react'


export default function Clock() {
    const [times, setTimes] = useState({
        polska: '00:00:00',
        floryda: '00:00:00',
        teksas: '00:00:00',
        gujana: '00:00:00'
    })


    useEffect(()=>{

        const updateTimes = () => {
            const now = new Date();
            setTimes({
                polska: now.toLocaleTimeString('pl-PL', { timeZone: 'Europe/Warsaw' }),
                floryda: now.toLocaleTimeString('pl-PL', { timeZone: 'America/New_York' }),
                teksas: now.toLocaleTimeString('pl-PL', { timeZone: 'America/Chicago' }),
                gujana: now.toLocaleTimeString('pl-PL', { timeZone: 'America/Guyana' })
            })
        }

        updateTimes()
        const interval = setInterval(updateTimes, 1000)
        return () => clearInterval(interval)
    },[])
    


    return (
        <section className="time-section">
            <h3>Godziny:</h3>
            <div>
                <div className="time-item">
                    <div className="location">Polska:</div>
                    <div className="time">{times.polska}</div>
                </div>
                <div className="time-item">
                    <div className="location">Spacex + NASA, Floryda:</div>
                    <div className="time">{times.floryda}</div>
                </div>
                <div className="time-item">
                    <div className="location">Spacex, Teksas:</div>
                    <div className="time">{times.teksas}</div>
                </div>
                <div className="time-item">
                    <div className="location">ESA, Gujana Francuska:</div>
                    <div className="time">{times.gujana}</div>
                </div>
            </div>
        </section>
    )
}