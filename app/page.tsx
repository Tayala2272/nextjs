



import './page.css'
import Clock from './components/Clock'


import { getLaunchesData } from './lib/launches'
import { getIssData } from './lib/iss'
import { getApodData } from './lib/apod'


// Interfaces
    interface LaunchData {
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
        weather?: {
            temperature: number;
            windspeed: number;
            winddirection: number;
            weathercode: number;
            time: string;
        }
        originalNetTime: string;
    }








export default async function App() {



    const launches:LaunchData[]|undefined = await getLaunchesData()
    const astronauts = await getIssData()
    const apod = await getApodData()

    let nextLaunch
    let upcomingLaunches
    if (Array.isArray(launches)){
        nextLaunch = launches[0]
        upcomingLaunches = launches.slice(1)
    }

    return (
        <div className="app">
            
            {/* godziny */}
                <Clock />





            {/* najbliższy odlot */}
                <section className="next-launch">
                    <h3>Najbliższy odlot rakiety</h3>
                    <div className="launch-content">
                        <img 
                            src={nextLaunch&& nextLaunch.imageUrl} 
                            alt={nextLaunch ? nextLaunch.rocketName:"Brak danych"} 
                            className="rocket-image"
                        />
                        <div className="launch-details">
                            <p><span>Rakieta:</span> {nextLaunch ? nextLaunch.rocketName : "Brak danych"}</p>
                            <p><span>Start z:</span> {nextLaunch ? nextLaunch.launchSite : "Brak danych"}</p>
                            <p><span>Czas startu (PL):</span> {nextLaunch ? nextLaunch.launchTimePL : "Brak danych"}</p>
                            <p><span>Czas lokalny:</span> {nextLaunch ? nextLaunch.launchTimeLocal : "Brak danych"}</p>
                            <p><span>Model:</span> {nextLaunch ? nextLaunch.rocketModel : "Brak danych"}</p>
                            <p><span>Misja:</span> {nextLaunch ? nextLaunch.mission : "Brak danych"}</p>
                        </div>
                    </div>






                    {/* pogoda w miejscu startu */}
                    <div className="weather-info">
                        <h3>Aktualna pogoda w miejscu startu:</h3>
                        {nextLaunch && nextLaunch.weather ? (
                            <>
                                <p>Temperatura: {nextLaunch.weather.temperature} °C</p>
                                <p>Prędkość wiatru: {nextLaunch.weather.windspeed} km/h</p>
                                <p>Kierunek wiatru: {nextLaunch.weather.winddirection}°</p>
                            </>
                        ) : (
                            <p>Brak danych pogodowych</p>
                        )}
                    </div>
                </section>






            {/* następne odloty */}
                <section className="upcoming">
                    <h3>Następne odloty</h3>
                    <div className="upcoming-list">
                        {upcomingLaunches ? upcomingLaunches.map((launch: LaunchData) => (
                            <div key={launch.id} className="upcoming-item">
                                <div className="launch-info">
                                    <div className="info-label">Rakieta:</div>
                                    <div className="rocket-name">{launch.rocketName}</div>
                                </div>
                                
                                <div className="launch-info">
                                    <div className="info-label">Data i godzina:</div>
                                    <div className="launch-date">{launch.launchTimePL}</div>
                                </div>
                                
                                <div className="launch-info">
                                    <div className="info-label">Start z:</div>
                                    <div className="launch-site">{launch.launchSite}</div>
                                </div>
                            </div>
                        )): "Brak danych o przyszłych odlotach"}
                    </div>
                </section>






            {/* Sekcja Zdjęcie dnia */}
                <section className="today-image">
                    <h3>Dzisiejsze zdjęcie z kosmosu</h3>
                    <p>Nasa każdego dnia publikuje jedno zdjęcie z kosmosu i udostępnia to zdjęcie ludzią na całym świecie</p>
                    <img 
                        src={apod.imageUrl}
                        alt="zdjęcie kosmosu" 
                        className="space-image"
                    />
                </section>





            {/* Sekcja ISS */}
                <section className="iss">
                    <h3>Lista astronautów przebywających aktualnie na Międzynarodowej Stacji Kosmicznej</h3>
                    <ul>
                        {astronauts.map((name: string, index: number) => (
                            <li key={index} className="astronaut-item">{name}</li>
                        ))}
                    </ul>
                </section>
        </div>
    )
}