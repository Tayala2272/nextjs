import { NextResponse } from 'next/server'
import axios from 'axios'
import moment from 'moment'

import * as Sentry from "@sentry/nextjs"

// ts
    interface Launch {
        id: string;
        name: string;
        net: string;
        pad: {
            timezone: string;
            location: {
            name: string;
            };
            latitude: number;
            longitude: number;
        };
        image: string;
        rocket: {
            configuration: {
            full_name: string;
            };
        };
        mission: {
            name: string;
        };
    }
    interface ProcessedLaunch {
        id: string;
        rocketName: string;
        imageUrl: string;
        launchSite: string;
        launchTimePL: string;
        launchTimeLocal: string;
        rocketModel: string;
        mission: string;
        latitude: number | string;
        longitude: number | string;
        weather?: any;
        originalNetTime: string;
    }




// cashe
    let launchesCache: { data: ProcessedLaunch[]; expiry: number } | null = null




// funkcja pomocnicza do formatowania daty
    const formatDate = (dateString: string, timezone: string): string => {
        if (!dateString) return "Brak daty"
        
        const date = moment(dateString);
        if (!date.isValid()) return "Nieprawidłowa data"
        
        return date.format('DD.MM.YYYY, HH:mm')
    }







// pomocnicza funkcja do pobierania pogody z danej lokalizacji
    const getWeatherData = async (latitude: number, longitude: number): Promise<any> => {
        try {
            if (!latitude || !longitude) {
                return { error: 'Brak wymaganych parametrów: latitude i longitude' }
            }
            
            const response = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            
            if (!response.data || !response.data.current_weather) {
                return { error: 'Nie znaleziono danych pogodowych' }
            }
            
            return response.data.current_weather;
        } catch (error) {
            
            // sentry log
                Sentry.captureException(error)
                await Sentry.flush(2000)

            return { error: 'Błąd pobierania pogody' }
        }
    }








// pomocnicza funkcja sprawdzająca, czy start rakiety się już odbył (jest potrzebna przy odświeżaniu cashe)
    const hasLaunchOccurred = (launches: ProcessedLaunch[]): boolean => {
        const now = moment()
        return launches.some(launch => {
            if (!launch.originalNetTime) return false
            
            const launchTime = moment(launch.originalNetTime)
            return launchTime.isBefore(now)
        })
    }




export async function GET() {
    try {
        const now = Date.now()
        let shouldRefreshCache = true

        // Sprawdź czy cache jest aktualny i czy żaden start się nie odbył
        if (launchesCache && now < launchesCache.expiry) {
            shouldRefreshCache = hasLaunchOccurred(launchesCache.data)
        }

        // jeśli cashe == ok, no to wysyłamy cashe
            if (launchesCache && !shouldRefreshCache) {
                return NextResponse.json(launchesCache.data)
            }



        // pobieranie danych o najbliższych 4x startach rakiet
            const response = await axios.get(`https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=4`)
            const launches: Launch[] = response.data.results || []

            if (launches.length === 0) {
                return NextResponse.json({ error: 'Brak danych o startach' }, { status: 404 })
            }




        // wyciąganie tylko tych informacji które są nam potrzebne, aby mniej danych do klienta wysyłać
            const processedLaunches: ProcessedLaunch[] = await Promise.all(
                launches.map(async (launch: Launch, index: number) => {
                    const timezone = launch.pad?.timezone || 'UTC'
                    const launchData: ProcessedLaunch = {
                        id: launch.id || `fallback-${Date.now()}-${index}`,
                        rocketName: launch.name || "Nieznana rakieta",
                        imageUrl: launch.image || 'https://picsum.photos/seed/picsum/200/300',
                        launchSite: launch.pad?.location?.name || "Nieznane miejsce startu",
                        launchTimePL: formatDate(launch.net, 'Europe/Warsaw'),
                        launchTimeLocal: formatDate(launch.net, timezone) + (launch.net ? ` ${timezone}` : ''),
                        rocketModel: launch.rocket?.configuration?.full_name || "Nieznany model",
                        mission: launch.mission?.name || 'Brak misji',
                        latitude: launch.pad?.latitude || "Brak danych",
                        longitude: launch.pad?.longitude || "Brak danych",
                        originalNetTime: launch.net // zachowujemy oryginalny czas do sprawdzenia
                    }

                    // dodawanie danych pogodowych tylko dla najbliższego startu
                    if (index === 0 && launch.pad?.latitude && launch.pad?.longitude) {
                        launchData.weather = await getWeatherData(launch.pad.latitude, launch.pad.longitude)
                    }

                    return launchData
                })
            )




            
            
            
            
        // aktualizacja cashe

            // najbliższa godzina odlotu
                const nextLaunchTime = processedLaunches
                    .map(launch => moment(launch.originalNetTime))
                    .filter(time => time.isValid())
                    .sort((a, b) => a.valueOf() - b.valueOf())[0]


            // domyślnie odśwież cashe po 1h jeśli nie ma godziny startu podanej
                let cacheExpiry = now + 60 * 60 * 1000 
            // natomiast jeśli jest podana godzina startu najbliższej rakiety to odświeża się po tej godzinie
                if (nextLaunchTime && nextLaunchTime.isAfter(moment())) {
                    cacheExpiry = nextLaunchTime.valueOf()
                }


            launchesCache = {
                data: processedLaunches,
                expiry: cacheExpiry
            }
            // log INFO
            Sentry.logger.info("Zaaktualizowano cashe LAUNCHES")



        // res
            return NextResponse.json(processedLaunches)



    } catch (error) {
        
        // sentry log
            Sentry.captureException(error)
            await Sentry.flush(2000)
            
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic'