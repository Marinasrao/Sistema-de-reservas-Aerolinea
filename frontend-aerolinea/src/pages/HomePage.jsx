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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [appliedCategories, setAppliedCategories] = useState([]);




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


                if (!res.ok) {
                    throw new Error("Error backend categorías");
                }

                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error al cargar categorías', err);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    const getIconForCharacteristic = (name = "") => {
        const key = name.toLowerCase();

        if (key.includes("equipaje") || key.includes("valija")) return "🧳";
        if (key.includes("wifi") || key.includes("wi-fi")) return "📶";
        if (key.includes("comida") || key.includes("almuerzo") || key.includes("cena")) return "🍴";
        if (key.includes("asiento")) return "💺";
        if (key.includes("hora") || key.includes("tiempo")) return "⏱️";
        if (key.includes("prioridad")) return "⭐";
        if (key.includes("check")) return "🛂";
        if (key.includes("mascota") || key.includes("pet")) return "🐶";

        return "✔️";
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleCategorySearch = () => {
        setAppliedCategories(selectedCategories);
    };

    const filteredCategories =
        appliedCategories.length === 0
            ? categories
            : categories.filter(cat => appliedCategories.includes(cat.id));

    const categoryIcons = {
        Nacionales: "🇦🇷",
        Internacionales: "🌍",
        "Low Cost": "💸",
        Premium: "👑",
    };



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
                                    className={`${styles.tabButton} ${searchParams.tripType === "roundtrip" ? styles.active : ""
                                        }`}
                                    onClick={() =>
                                        setSearchParams({ ...searchParams, tripType: "roundtrip" })
                                    }
                                >
                                    Ida y vuelta
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.tabButton} ${searchParams.tripType === "oneway" ? styles.active : ""
                                        }`}
                                    onClick={() =>
                                        setSearchParams({ ...searchParams, tripType: "oneway" })
                                    }
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
                                            onChange={(text) =>
                                                setSearchParams({ ...searchParams, origin: text })
                                            }
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
                                            onChange={(text) =>
                                                setSearchParams({ ...searchParams, destination: text })
                                            }
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
                                            value={searchParams.date}
                                            onChange={(e) =>
                                                setSearchParams({
                                                    ...searchParams,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                            className={styles.textInput}
                                        />
                                    </div>
                                </div>

                                {searchParams.tripType === "roundtrip" && (
                                    <div className={styles.inputGroup}>
                                        <label>Fecha de regreso</label>
                                        <div className={styles.inputWithIcon}>
                                            <span className={styles.calendarIcon}>📅</span>
                                            <input
                                                type="date"
                                                value={searchParams.returnDate}
                                                onChange={(e) =>
                                                    setSearchParams({
                                                        ...searchParams,
                                                        returnDate: e.target.value,
                                                    })
                                                }
                                                required
                                                className={styles.textInput}
                                            />
                                        </div>
                                    </div>
                                )
                                }


                                <div className={styles.inputGroup}>
                                    <label>Pasajeros</label>
                                    <div className={styles.inputWithIcon}>
                                        <span className={styles.locationIcon}>👥</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={searchParams.passengers}
                                            onChange={(e) =>
                                                setSearchParams({
                                                    ...searchParams,
                                                    passengers: parseInt(e.target.value, 10) || 1,
                                                })
                                            }
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
                                            value={searchParams.flightClass}
                                            onChange={(e) =>
                                                setSearchParams({
                                                    ...searchParams,
                                                    flightClass: e.target.value,
                                                })
                                            }
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

                {/* CATEGORÍAS */}
                <section className={styles.categoriesSection}>
                    <h3>Categorías destacadas</h3>

                    {Array.isArray(categories) && categories.length > 0 ? (
                        <div className={styles.categoriesGrid}>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={`/category-results?categories=${cat.id}`}
                                    className={styles.categoryCard}
                                >
                                    {cat.image ? (
                                        <img
                                            src={`http://localhost:8080/uploads/categories/${cat.image}`}
                                            alt={cat.title}
                                            className={styles.categoryImage}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder.jpg";
                                            }}
                                        />
                                    ) : (
                                        <div className={styles.noImage}>Sin imagen</div>
                                    )}

                                    <h4>{cat.title}</h4>

                                    {cat.promoText && (
                                        <p className={styles.categoryPromo}>{cat.promoText}</p>
                                    )}
                                </Link>
                            ))}

                        </div>
                    ) : (
                        <p style={{ opacity: 0.6 }}>No hay categorías disponibles</p>
                    )}
                </section>

                {/* FILTRO POR CATEGORÍAS – */}
                <section className={styles.filterSection}>
                    <h4 className={styles.filterTitle}>🎛️ Filtrar por categorías</h4>


                    <div className={styles.filterRow}>
                        {filteredCategories.map((cat) => (
                            <label
                                key={cat.id}
                                className={`${styles.filterOption} ${selectedCategories.includes(cat.id) ? styles.active : ""
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.id)}
                                    onChange={() => toggleCategory(cat.id)}
                                />

                                <span className={styles.filterIcon}>
                                    {categoryIcons[cat.title] || "✈️"}
                                </span>

                                <span>{cat.title}</span>
                            </label>
                        ))}

                        <div className={styles.filterActions}>
                            <button
                                className={styles.searchBtn}
                                onClick={() => {
                                    if (selectedCategories.length === 0) return;
                                    navigate(
                                        `/category-results?categories=${selectedCategories.join(",")}`
                                    );
                                }}
                            >
                                Buscar
                            </button>

                            <button
                                className={styles.clearBtn}
                                onClick={() => setSelectedCategories([])}
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                </section>


                <section className={styles.featuresSection}>
                    <h3 className={styles.featuresTitle}>Características del vuelo</h3>

                    <div className={styles.featuresGrid}>
                        {categories.map((cat) => (
                            <div key={cat.id} className={styles.featuresCategory}>
                                <h4 className={styles.featuresCategoryTitle}>{cat.title}</h4>

                                {Array.isArray(cat.characteristics) && cat.characteristics.length > 0 ? (
                                    <ul className={styles.featuresList}>
                                        {cat.characteristics.map((ch) => (
                                            <li key={ch.id} className={styles.featureItem}>
                                                <span className={styles.featureIcon}>
                                                    {getIconForCharacteristic(ch.name)}
                                                </span>
                                                <span className={styles.featureText}>{ch.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.featuresEmpty}>
                                        No hay características asignadas
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>



                {/* RECOMENDACIONES */}
                < section className={styles.recommendationsSection} >
                    <h3>Recomendaciones para ti</h3>

                    {
                        loadingRecommendations ? (
                            <p style={{ opacity: 0.6 }}>Cargando recomendaciones...</p>
                        ) : (
                            <div className={styles.recsGrid}>
                                {recommendations.slice(0, 10).map((rec) => {
                                    const focalPos =
                                        rec.focal === "top"
                                            ? "top"
                                            : rec.focal === "bottom"
                                                ? "bottom"
                                                : "center";

                                    const focalClass = styles[`focal-${focalPos}`];

                                    const imageName = rec.imageUrl
                                        ? rec.imageUrl.replace(/^.*[\\/]/, "")
                                        : null;

                                    const imageSrc = imageName
                                        ? `http://localhost:8080/uploads/recommendations/${imageName}`
                                        : null;

                                    return (
                                        <Link
                                            to={`/recommendations/${rec.id}`}
                                            key={rec.id}
                                            className={styles.recCard}
                                        >
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={rec.title}
                                                    className={`${styles.recImage} ${focalClass}`}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/placeholder.jpg";
                                                    }}
                                                />
                                            ) : (
                                                <div className={styles.noImage}>Sin imagen</div>
                                            )}

                                            <div className={styles.recContent}>
                                                <div className={styles.recHeader}>
                                                    {rec.origin && (
                                                        <span className={styles.recLabel}>
                                                            Desde {rec.origin}
                                                        </span>
                                                    )}
                                                    {rec.flightType && (
                                                        <span className={styles.recBadge}>
                                                            {rec.flightType}
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className={styles.recTitle}>{rec.title}</h4>

                                                {rec.airport && (
                                                    <p className={styles.recAirport}>{rec.airport}</p>
                                                )}

                                                {rec.departureDate && (
                                                    <p className={styles.recDates}>
                                                        Ida:{" "}
                                                        {new Date(rec.departureDate).toLocaleDateString(
                                                            "es-AR"
                                                        )}
                                                    </p>
                                                )}

                                                <div className={styles.recBottomRow}>
                                                    <span className={styles.recPrice}>
                                                        {rec.price != null
                                                            ? `AR$ ${Number(rec.price).toLocaleString("es-AR")}`
                                                            : "Precio no disponible"}
                                                    </span>

                                                    {rec.discountPercent != null &&
                                                        Number(rec.discountPercent) > 0 && (
                                                            <span className={styles.recDiscount}>
                                                                -{rec.discountPercent}%
                                                            </span>
                                                        )}
                                                </div>

                                                <p className={styles.recTaxes}>Tasas incluidas</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    }
                </section >
            </div >
        </>
    );
};


export default HomePage;
