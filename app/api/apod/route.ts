

import { NextResponse } from 'next/server'
import axios from 'axios'
import moment from 'moment-timezone'

import * as Sentry from "@sentry/nextjs"


let nasaCache: { data: any; expiry: number } | null = null
const nasaApiKey = process.env.NASA_API_KEY


export async function GET() {
    try {
        const now = Date.now()

        // sprawdzenie cashe
            if (nasaCache && now < nasaCache.expiry) {
                return NextResponse.json({ imageUrl: nasaCache.data.url })
            }


        // env check
            if (!nasaApiKey) {
                return NextResponse.json(
                    { error: 'NASA API key not configured' },
                    { status: 500 }
                )
            }

        // zapytanie do nasa
            const response = await axios.get(
                `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`
            )

        // aktualizacja cashe oraz ustawienie, aby się odświeżyło dopiero wtedy kiedy NASA odświeży zdjęcie w ich API, czyli następnej północy czasu EST
            const nextMidnightEST = moment().tz('America/New_York').add(1, 'day').startOf('day').valueOf()
            nasaCache = {
                data: response.data,
                expiry: nextMidnightEST
            }
            // log INFO
            Sentry.logger.info("Zaaktualizowano cashe APOD")



        return NextResponse.json({ imageUrl: response.data.url });
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

export const dynamic = 'force-dynamic'