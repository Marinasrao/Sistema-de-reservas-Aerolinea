import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RecommendationDetailPage.module.css';
import { recoUrl } from '../config/mediaPaths';
import AvailabilityCalendar from '../components/availability/AvailabilityCalendar';

const safeRecoUrl = (name) => {
    if (!name || typeof name !== 'string') return '';
    if (/^https?:\/\//i.test(name)) return name;
    return `${recoUrl(name)}`;
};

const RecommendationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

    const availableDates = [
        '2026-02-05',
        '2026-02-06',
        '2026-02-10',
        '2026-02-15',
    ];

    const unavailableDates = [
        '2026-02-07',
        '2026-02-08',
        '2026-02-12',
    ];

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/recommendations/${id}`);
                const data = await res.json();
                if (alive) setRecommendation(data);
            } catch {
                if (alive) setRecommendation(null);
            } finally {
                if (alive) setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) return <p className={styles.loading}>Cargando...</p>;
    if (!recommendation) return <p>Error al cargar detalles.</p>;

    const {
        title,
        longDescription,
        mainImage,
        imageUrl,
        image1,
        image2,
        image3,
        image4,
    } = recommendation;

    const mainSrc = safeRecoUrl(mainImage || imageUrl);
    const gallery = [image1, image2, image3, image4]
        .filter(Boolean)
        .map(safeRecoUrl);

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

                {/* GALERÍA */}
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

                {/* CALENDARIO */}
                <div className={styles.calendarsWrapper}>
                    <div className={styles.singleCalendar}>
                        <h3 className={styles.calendarTitle}>Fecha de salida</h3>

                        <AvailabilityCalendar
                            availableDates={availableDates}
                        />
                    </div>

                    <div className={styles.singleCalendar}>
                        <h3 className={styles.calendarTitle}>Fecha de regreso</h3>

                        <AvailabilityCalendar
                            availableDates={availableDates}
                        />
                    </div>
                </div>


                <div className={styles.calendarLegend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.availableDot}`} />
                        <span>Disponible</span>
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.unavailableDot}`} />
                        <span>No disponible</span>
                    </div>
                </div>


                {/* RESERVAR */}
                <div className={styles.reserveWrapper}>
                    <button className={styles.reserveBtn}>
                        Reservar
                    </button>
                </div>

                {/* VER MÁS */}
                <div className={styles.viewMoreWrapper}>
                    <button
                        className={styles.viewMoreBtn}
                        onClick={() =>
                            navigate(`/recommendations/${id}/gallery`)
                        }
                    >
                        Ver más →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationDetailPage;
