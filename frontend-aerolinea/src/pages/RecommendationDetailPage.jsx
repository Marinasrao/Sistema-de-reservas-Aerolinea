import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RecommendationDetailPage.module.css';
import { recoUrl } from '../config/mediaPaths';

const API_BASE = 'http://localhost:8080/api';

const safeRecoUrl = (name) => {
    if (!name || typeof name !== 'string') return '';
    if (/^https?:\/\//i.test(name)) return name;
    return `${recoUrl(name)}`;
};

const destinationCountries = {
    "bariloche": "Argentina",
    "cordoba": "Argentina",
    "córdoba": "Argentina",
    "calafate": "Argentina",
    "iguazu": "Argentina",
    "iguazú": "Argentina",
    "jujuy": "Argentina",
    "mendoza": "Argentina",
    "puerto madryn": "Argentina",
    "salta": "Argentina",
    "ushuaia": "Argentina",
    "buenos aires": "Argentina",
    "colombia": "Colombia",
    "dubai": "Emiratos Árabes Unidos",
    "dubái": "Emiratos Árabes Unidos",
    "estambul": "Turquía",
    "londres": "Reino Unido",
    "madrid": "España",
    "miami": "Estados Unidos",
    "new york": "Estados Unidos",
    "nueva york": "Estados Unidos",
    "paris": "Francia",
    "parís": "Francia",
    "rio de janeiro": "Brasil",
    "río de janeiro": "Brasil",
    "roma": "Italia",
    "tokio": "Japón"
};

const getDestinationCountry = (destination = "", title = "") => {
    const key = String(destination || title).toLowerCase().trim();

    const match = Object.keys(destinationCountries).find((item) =>
        key.includes(item)
    );

    return match ? destinationCountries[match] : "Consultar región";
};

const RecommendationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [recommendation, setRecommendation] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({
        averageRating: 0,
        totalReviews: 0,
    });

    const [loading, setLoading] = useState(true);
    const [loadingPolicies, setLoadingPolicies] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const [shareOpen, setShareOpen] = useState(false);
    const [shareMessage, setShareMessage] = useState('');
    const [shareNotice, setShareNotice] = useState('');

    useEffect(() => {
        let alive = true;

        const fetchRecommendation = async () => {
            try {
                const res = await fetch(`${API_BASE}/recommendations/${id}`);

                if (!res.ok) {
                    throw new Error('No se pudo cargar la recomendación');
                }

                const data = await res.json();

                if (alive) {
                    setRecommendation(data);
                }
            } catch {
                if (alive) {
                    setRecommendation(null);
                }
            } finally {
                if (alive) {
                    setLoading(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        };

        fetchRecommendation();

        return () => {
            alive = false;
        };
    }, [id]);

    useEffect(() => {
        let alive = true;

        const fetchPolicies = async () => {
            try {
                const res = await fetch(`${API_BASE}/policies`);

                if (!res.ok) {
                    throw new Error('No se pudieron cargar las políticas');
                }

                const data = await res.json();

                if (alive) {
                    setPolicies(Array.isArray(data) ? data : []);
                }
            } catch {
                if (alive) {
                    setPolicies([]);
                }
            } finally {
                if (alive) {
                    setLoadingPolicies(false);
                }
            }
        };

        fetchPolicies();

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;

        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);

                const [reviewsRes, summaryRes] = await Promise.all([
                    fetch(`${API_BASE}/reviews/recommendation/${id}`),
                    fetch(`${API_BASE}/reviews/recommendation/${id}/summary`),
                ]);

                if (!reviewsRes.ok || !summaryRes.ok) {
                    throw new Error('No se pudieron cargar las valoraciones');
                }

                const reviewsData = await reviewsRes.json();
                const summaryData = await summaryRes.json();

                if (alive) {
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                    setReviewSummary({
                        averageRating: Number(summaryData?.averageRating || 0),
                        totalReviews: Number(summaryData?.totalReviews || 0),
                    });
                }
            } catch {
                if (alive) {
                    setReviews([]);
                    setReviewSummary({
                        averageRating: 0,
                        totalReviews: 0,
                    });
                }
            } finally {
                if (alive) {
                    setLoadingReviews(false);
                }
            }
        };

        fetchReviews();

        return () => {
            alive = false;
        };
    }, [id]);

    useEffect(() => {
        if (!recommendation) return;

        const destinationText = recommendation.destination || recommendation.title || 'este destino';
        const countryText = getDestinationCountry(recommendation.destination, recommendation.title);

        setShareMessage(
            `Mirá este destino recomendado en FlightBooking: ${destinationText}${countryText !== "Consultar región" ? `, ${countryText}` : ""}.`
        );
    }, [recommendation]);

    if (loading) return <p className={styles.loading}>Cargando...</p>;
    if (!recommendation) return <p className={styles.error}>Error al cargar detalles.</p>;

    const {
        title,
        description,
        longDescription,
        mainImage,
        imageUrl,
        image1,
        image2,
        image3,
        image4,
        destination,
        airport,
    } = recommendation;

    const mainSrc = safeRecoUrl(mainImage || imageUrl);
    const gallery = [image1, image2, image3, image4]
        .filter(Boolean)
        .map(safeRecoUrl);

    const country = getDestinationCountry(destination, title);
    const destinationName = destination || title;
    const productUrl = window.location.href;
    const productLocation = [destinationName, country, airport].filter(Boolean).join(' · ');
    const shareText = `${shareMessage}\n${productUrl}`;

    const averageRating = Number(reviewSummary.averageRating || 0);
    const totalReviews = Number(reviewSummary.totalReviews || 0);

    const copyShareText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setShareNotice('Contenido copiado al portapapeles.');
        } catch {
            setShareNotice('No se pudo copiar el contenido.');
        }
    };

    const handleShare = async (network) => {
        const encodedUrl = encodeURIComponent(productUrl);
        const encodedText = encodeURIComponent(shareMessage);

        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        };

        if (network === 'copy') {
            await copyShareText();
            return;
        }

        if (network === 'instagram') {
            await copyShareText();
            window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
            setShareNotice('Copiamos el contenido para que lo pegues en Instagram.');
            return;
        }

        window.open(urls[network], '_blank', 'noopener,noreferrer');
    };

    const renderStars = (value) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index}>
                {index < value ? '★' : '☆'}
            </span>
        ));
    };

    return (
        <div className={styles.detailContainer}>
            <header className={styles.detailHeader}>
                <h2 className={styles.title}>{title}</h2>

                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    ← Volver
                </button>
            </header>

            <div className={styles.detailContent}>
                {longDescription && (
                    <p className={styles.description}>{longDescription}</p>
                )}

                <div className={styles.galleryBlock}>
                    {mainSrc && (
                        <div className={styles.mainImage}>
                            <img
                                src={mainSrc}
                                alt={title}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    )}

                    {gallery.length > 0 && (
                        <div className={styles.gridImages}>
                            {gallery.map((src, index) => (
                                <div key={index} className={styles.gridItem}>
                                    <img
                                        src={src}
                                        alt={`${title} ${index + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <section className={styles.locationSection}>
                    <div className={styles.locationContent}>
                        <span className={styles.locationEyebrow}>Destino recomendado</span>

                        <h3>
                            {destinationName}
                            {country !== "Consultar región" ? `, ${country}` : ""}
                        </h3>

                        <p>
                            Una propuesta seleccionada por FlightBooking para descubrir nuevos
                            lugares y planificar tu próximo viaje.
                        </p>

                        <div className={styles.locationGrid}>
                            <div className={styles.locationCard}>
                                <span>📍 Destino</span>
                                <strong>{destinationName}</strong>
                            </div>

                            <div className={styles.locationCard}>
                                <span>🌍 País / región</span>
                                <strong>{country}</strong>
                            </div>

                            <div className={styles.locationCard}>
                                <span>✈️ Aeropuerto de referencia</span>
                                <strong>{airport || "Consultar disponibilidad"}</strong>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.shareButton}
                        onClick={() => {
                            setShareOpen(true);
                            setShareNotice('');
                        }}
                    >
                        Compartir en redes
                    </button>
                </section>

                <section className={styles.policiesSection}>
                    <div className={styles.policiesHeader}>
                        <span className={styles.policiesEyebrow}>Información importante</span>
                        <h3>Políticas del viaje</h3>
                    </div>

                    {loadingPolicies ? (
                        <p className={styles.policiesLoading}>Cargando políticas...</p>
                    ) : policies.length === 0 ? (
                        <p className={styles.policiesEmpty}>
                            No hay políticas disponibles para mostrar.
                        </p>
                    ) : (
                        <div className={styles.policiesGrid}>
                            {policies.map((policy) => (
                                <article key={policy.id} className={styles.policyCard}>
                                    <div className={styles.policyNumber}>
                                        {String(policy.displayOrder || policy.id).padStart(2, '0')}
                                    </div>

                                    <div>
                                        <h4>{policy.title}</h4>
                                        <p>{policy.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.reviewsSection}>
                    <div className={styles.reviewsHeader}>
                        <div>
                            <span className={styles.reviewsEyebrow}>Experiencias de usuarios</span>
                            <h3>Valoraciones del destino</h3>
                        </div>

                        <div className={styles.ratingSummary}>
                            <strong>{averageRating ? averageRating.toFixed(1) : '0.0'}</strong>
                            <div className={styles.summaryStars}>
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span>
                                {totalReviews} {totalReviews === 1 ? 'valoración' : 'valoraciones'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.reviewLocked}>
                        <h4>¿Ya viajaste con este destino?</h4>
                        <p>
                            Podés puntuar tu experiencia desde tu perfil, en la sección Mis reservas.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/profile#reservas')}
                        >
                            Ir a mis reservas
                        </button>
                    </div>

                    {loadingReviews ? (
                        <p className={styles.noReviews}>
                            Cargando valoraciones...
                        </p>
                    ) : reviews.length > 0 ? (
                        <div className={styles.reviewsList}>
                            {reviews.map((review) => (
                                <article key={review.id} className={styles.reviewCard}>
                                    <div className={styles.reviewTop}>
                                        <div>
                                            <h4>{review.userName || 'Usuario FlightBooking'}</h4>
                                            <span>
                                                {review.createdAt
                                                    ? new Date(review.createdAt).toLocaleDateString('es-AR')
                                                    : 'Fecha no disponible'}
                                            </span>
                                        </div>

                                        <div className={styles.reviewStars}>
                                            {renderStars(Number(review.rating || 0))}
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p>{review.comment}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noReviews}>
                            Todavía no hay valoraciones para este destino.
                        </p>
                    )}
                </section>

                <div className={styles.reserveWrapper}>
                    <button
                        type="button"
                        className={styles.reserveBtn}
                        onClick={() => {
                            navigate(`/?destination=${encodeURIComponent(destinationName)}`);
                        }}
                    >
                        Reservar
                    </button>
                </div>

                <div className={styles.viewMoreWrapper}>
                    <button
                        className={styles.viewMoreBtn}
                        onClick={() => navigate(`/recommendations/${id}/gallery`)}
                    >
                        Ver más →
                    </button>
                </div>
            </div>

            {shareOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.shareModal}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.shareEyebrow}>Compartir producto</span>
                                <h3>Compartir este destino</h3>
                            </div>

                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={() => setShareOpen(false)}
                                aria-label="Cerrar ventana de compartir"
                            >
                                <span>✕</span>
                            </button>
                        </div>

                        <div className={styles.sharePreview}>
                            {mainSrc && (
                                <img
                                    src={mainSrc}
                                    alt={title}
                                    className={styles.sharePreviewImage}
                                />
                            )}

                            <div className={styles.sharePreviewInfo}>
                                <h4>{title}</h4>
                                {productLocation && <p>{productLocation}</p>}
                                {description && <span>{description}</span>}
                            </div>
                        </div>

                        <div className={styles.shareField}>
                            <label>Mensaje personalizado</label>
                            <textarea
                                value={shareMessage}
                                onChange={(e) => setShareMessage(e.target.value)}
                                rows="4"
                            />
                        </div>

                        <div className={styles.shareLinkBox}>
                            <span>{productUrl}</span>
                        </div>

                        {shareNotice && (
                            <p className={styles.shareNotice}>{shareNotice}</p>
                        )}

                        <div className={styles.shareOptions}>
                            <button type="button" onClick={() => handleShare('facebook')}>
                                <span className={styles.shareIcon}>f</span>
                                Facebook
                            </button>

                            <button type="button" onClick={() => handleShare('twitter')}>
                                <span className={styles.shareIcon}>𝕏</span>
                                Twitter/X
                            </button>

                            <button type="button" onClick={() => handleShare('instagram')}>
                                <span className={styles.shareIcon}>◎</span>
                                Instagram
                            </button>

                            <button type="button" onClick={() => handleShare('whatsapp')}>
                                <span className={styles.shareIcon}>☘</span>
                                WhatsApp
                            </button>

                            <button type="button" onClick={() => handleShare('copy')}>
                                <span className={styles.shareIcon}>🔗</span>
                                Copiar enlace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationDetailPage;