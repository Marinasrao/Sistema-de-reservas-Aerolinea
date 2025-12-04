import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './SearchResultsPage.module.css';

const API_BASE = 'http://localhost:8080/api';
const PALETTE = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const dateFromLocalDate = (s) => {
    if (!s) return new Date(NaN);
    const [y, m, d] = s.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};

const formatDayTitle = (s) =>
    new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    }).format(dateFromLocalDate(s));

function groupByDate(items) {
    const map = new Map();
    for (const f of items) {
        const key = f.departureDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(f);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function SearchResultsPage() {
    const [params] = useSearchParams();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const flightsPerPage = 10;

    const origin = params.get('origin') || '';
    const destination = params.get('destination') || '';
    const fromDate = params.get('fromDate') || '';
    const ymParam = params.get('ym') || new Date().toISOString().slice(0, 7);

    const groups = useMemo(() => groupByDate(flights), [flights]);

    const allFlights = useMemo(() => groups.flatMap(([_, fs]) => fs), [groups]);
    const totalPages = Math.ceil(allFlights.length / flightsPerPage);
    const currentFlights = allFlights.slice((currentPage - 1) * flightsPerPage, currentPage * flightsPerPage);

    const visibleGroups = useMemo(() => {
        const grouped = new Map();
        for (const flight of currentFlights) {
            const key = flight.departureDate;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(flight);
        }
        return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [currentFlights]);

    useEffect(() => {
        const fetchFlights = async () => {
            setLoading(true);
            try {
                let url = '';
                if (origin && destination && fromDate) {
                    url = `${API_BASE}/flights/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&fromDate=${fromDate}`;
                } else if (destination && ymParam) {
                    url = `${API_BASE}/flights/search/by-destination-and-month?destination=${encodeURIComponent(destination)}&ym=${ymParam}`;
                } else {
                    setFlights([]);
                    return;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const content = Array.isArray(json) ? json : json.content || [];
                setFlights(content);
                setCurrentPage(1);
            } catch (err) {
                console.error('Error buscando vuelos:', err);
                setFlights([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [origin, destination, fromDate, ymParam]);

    return (
        <>
            <div className={styles.topSpacer} />
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>
                        Vuelos {origin && `desde ${origin}`} {destination && `a ${destination}`}
                    </h1>
                    <div className={styles.counter}>
                        {loading ? 'Cargando…' : `${flights.length} resultados en ${totalPages} páginas`}
                    </div>
                </header>

                {!loading && flights.length === 0 && (
                    <div className={styles.empty}>
                        No encontramos vuelos con esos criterios. Probá con otros valores.
                    </div>
                )}

                {visibleGroups.map(([date, grouped], idx) => (
                    <section
                        key={date}
                        className={styles.daySection}
                        style={{ '--accent': PALETTE[idx % PALETTE.length] }}
                    >
                        <h2 className={styles.dayTitle}>{formatDayTitle(date)}</h2>
                        <div className={styles.list}>
                            {grouped.map((f) => (
                                <article key={f.id} className={styles.card}>
                                    <div className={styles.cardMain}>
                                        <div className={styles.times}>
                                            <div className={styles.time}>
                                                <span>Sale</span>
                                                <strong>{f.departureTime}</strong>
                                                <small>{f.origin}</small>
                                            </div>
                                            <div className={styles.time}>
                                                <span>Llega</span>
                                                <strong>{f.arrivalTime}</strong>
                                                <small>{f.destination}</small>
                                            </div>
                                        </div>
                                        <div className={styles.meta}>
                                            <div className={styles.airline}>{f.airline || '—'}</div>
                                            <div className={styles.number}>{f.flightNumber}</div>
                                            <div className={styles.aircraft}>{f.aircraftType || ''}</div>
                                        </div>
                                    </div>
                                    <div className={styles.cardAside}>
                                        <div className={styles.price}>
                                            {typeof f.price === 'number'
                                                ? `$${f.price.toLocaleString()}`
                                                : `$${f.price}`}
                                        </div>
                                        <div className={styles.seats}>{f.seatsAvailable} asientos</div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}

                {totalPages > 1 && (
                    <div className={styles.pager}>
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⏮️ Inicio</button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>◀️ Anterior</button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente ▶️</button>
                    </div>
                )}
            </div>
        </>
    );
}

