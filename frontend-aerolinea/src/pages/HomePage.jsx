import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import HeroCarousel from '../components/HeroCarousel.jsx';
import DestinationAutocomplete from '../components/DestinationAutocomplete.jsx';

const API_BASE = 'http://localhost:8080/api';

const ImageWithSkeleton = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {!loaded && <div className={styles.skeletonImage}></div>}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={loaded ? styles.imageVisible : styles.imageHidden}
                loading="lazy"
            />
        </>
    );
};

const HomePage = () => {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useState({
        origin: '',
        destination: '',
        date: '',
        returnDate: '',
        passengers: 1,
        tripType: 'roundtrip',
        flightClass: 'economy',
    });

    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [categories, setCategories] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = (searchParams.destination || searchParams.origin || '').trim();
        if (!term) return;

        navigate(`/search-results?origin=${encodeURIComponent(searchParams.origin)}&destination=${encodeURIComponent(searchParams.destination)}&fromDate=${searchParams.date}`);
    };

    useEffect(() => {
        (async () => {
            try {
                const r2 = await fetch(`${API_BASE}/recommendations/random`);
                const d2 = await r2.json().catch(() => []);
                setRecommendations(Array.isArray(d2) ? d2 : []);
            } catch (err) {
                console.error('Error cargando recomendaciones:', err);
                setRecommendations([]);
            } finally {
                setLoadingRecommendations(false);
            }
        })();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/categories`);
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Error al cargar categorías', err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <>
            <div className={styles.homeContainer}>
                {/* Hero con carrusel + formulario flotante encima */}
                <div className={styles.heroSection}>
                    <HeroCarousel />

                    <div className={styles.heroSearchOverlay}>
                        <form onSubmit={handleSearch}>
                            <div className={styles.searchTabs}>
                                <button
                                    type="button"
                                    className={`${styles.tabButton} ${searchParams.tripType === 'roundtrip' ? styles.active : ''}`}
                                    onClick={() => setSearchParams({ ...searchParams, tripType: 'roundtrip' })}
                                >
                                    Ida y vuelta
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.tabButton} ${searchParams.tripType === 'oneway' ? styles.active : ''}`}
                                    onClick={() => setSearchParams({ ...searchParams, tripType: 'oneway' })}
                                >
                                    Solo ida
                                </button>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Origen</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.locationIcon}>📍</span>
                                        <DestinationAutocomplete
                                            value={searchParams.origin}
                                            onChange={(text) => setSearchParams({ ...searchParams, origin: text })}
                                            placeholder="Ciudad de origen"
                                            inputProps={{
                                                required: true,
                                                className: styles.textInput,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Destino</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.locationIcon}>📍</span>
                                        <DestinationAutocomplete
                                            value={searchParams.destination}
                                            onChange={(text) => setSearchParams({ ...searchParams, destination: text })}
                                            placeholder="Ciudad de destino"
                                            inputProps={{
                                                required: true,
                                                className: styles.textInput,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Fecha de salida</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.calendarIcon}>📅</span>
                                        <input
                                            type="date"
                                            name="date"
                                            value={searchParams.date}
                                            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                            required
                                            className={styles.textInput}
                                        />
                                    </div>
                                </div>

                                {searchParams.tripType === 'roundtrip' && (
                                    <div className={styles.inputGroup}>
                                        <label>Fecha de regreso</label>
                                        <div className={styles.inputWithIcon}>
                                            <span className={styles.calendarIcon}>📅</span>
                                            <input
                                                type="date"
                                                name="returnDate"
                                                value={searchParams.returnDate}
                                                onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                                                required
                                                className={styles.textInput}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <label>Pasajeros</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.locationIcon}>👥</span>
                                        <input
                                            type="number"
                                            name="passengers"
                                            min="1"
                                            max="10"
                                            value={searchParams.passengers}
                                            onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value, 10) || 1 })}
                                            required
                                            className={styles.textInput}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Clase</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.locationIcon}>💺</span>
                                        <select
                                            name="flightClass"
                                            value={searchParams.flightClass}
                                            onChange={(e) => setSearchParams({ ...searchParams, flightClass: e.target.value })}
                                            className={styles.textInput}
                                        >
                                            <option value="economy">Económica</option>
                                            <option value="business">Ejecutiva</option>
                                            <option value="first">Primera</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={styles.airlineSearchButton}>
                                Buscar vuelos
                            </button>
                        </form>
                    </div>
                </div>

                <section className={styles.recommendationsSection}>
                    <h3>Recomendaciones para ti</h3>
                    <div className={styles.recsGrid}>
                        {recommendations.slice(0, 10).map((rec) => {
                            const focalPos = rec.focal === 'top' ? 'top' : rec.focal === 'bottom' ? 'bottom' : 'center';
                            const focalClass = styles[`focal-${focalPos}`];

                            return (
                                <Link to={`/recommendations/${rec.id}`} key={rec.id} className={styles.recCard}>
                                    <img
                                        src={`http://localhost:8080/uploads/recommendations/${rec.imageUrl}`}
                                        alt={rec.title}
                                        className={`${styles.recImage} ${focalClass}`}
                                        loading="lazy"
                                    />
                                    <div className={styles.recContent}>
                                        <div className={styles.recHeader}>
                                            {rec.origin && <span className={styles.recLabel}>Desde {rec.origin}</span>}
                                            {rec.flightType && <span className={styles.recBadge}>{rec.flightType}</span>}
                                        </div>
                                        <h4 className={styles.recTitle}>{rec.title}</h4>
                                        {rec.airport && <p className={styles.recAirport}>{rec.airport}</p>}
                                        {rec.departureDate && <p className={styles.recDates}>Ida: {new Date(rec.departureDate).toLocaleDateString('es-AR')}</p>}
                                        <div className={styles.recBottomRow}>
                                            <span className={styles.recPrice}>
                                                {rec.price != null
                                                    ? `AR$ ${Number(rec.price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                                    : 'Precio no disponible'}
                                            </span>
                                            {rec.discountPercent != null && Number(rec.discountPercent) > 0 && (
                                                <span className={styles.recDiscount}>-{rec.discountPercent}%</span>
                                            )}
                                        </div>
                                        <p className={styles.recTaxes}>Tasas incluidas</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.categoriesSection}>
                    <h3>Categorías destacadas</h3>
                    <div className={styles.categoriesGrid}>
                        {categories.map((cat) => (
                            <div key={cat.id} className={styles.categoryCard}>
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className={styles.categoryImage}
                                    loading="lazy"
                                />
                                <h4>{cat.title}</h4>
                                {cat.promoText && <p className={styles.categoryPromo}>{cat.promoText}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

        
        </>
    );
};

export default HomePage;
