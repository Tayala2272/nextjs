


import { NextResponse } from 'next/server'
import axios from 'axios'
import moment from 'moment'

import * as Sentry from "@sentry/nextjs"

// cashe
let astronautsCache: { data: string[]; expiry: number } | null = null


export async function GET() {
    try {
        // sprawdzanie czy cashe jest nadal ok
            const now = Date.now()
            if (astronautsCache && now < astronautsCache.expiry) {
                return NextResponse.json(astronautsCache.data)
            }

        
        // pobieranie z API listy astronautów aktualnie na ISS
            const response = await axios.get('http://api.open-notify.org/astros.json')
            const astronauts = response.data.people
                .filter((person:any) => person.craft === 'ISS')
                .map((person:any) => `${person.name}`)


        // aktualizacja cashe
            const nextMidnightUTC = moment().utc().add(1, 'day').startOf('day').valueOf()
            astronautsCache = {
                data: astronauts,
                expiry: nextMidnightUTC
            }
            // log INFO
            Sentry.logger.info("Zaaktualizowano cashe ISS")


        return NextResponse.json(astronauts)

        
    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)
            
        return NextResponse.json(
            { error: 'Błąd serwera' },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic';