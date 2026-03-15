import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./CategoryResultsPage.module.css";

const API_BASE = "http://localhost:8080/api";

const CategoryResultsPage = () => {
    const [searchParams] = useSearchParams();

    const categoryIds = useMemo(() => {
        return searchParams
            .get("categories")
            ?.split(",")
            .map(Number)
            .filter(Boolean) || [];
    }, [searchParams]);

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (categoryIds.length === 0) {
            setGroups([]);
            return;
        }

        const fetchEditorialGroups = async () => {
            setLoading(true);
            try {
                const params = categoryIds.join(",");

                const res = await fetch(
                    `${API_BASE}/categories/editorial?ids=${params}`
                );

                if (!res.ok) {
                    throw new Error("Error cargando resultados");
                }

                const data = await res.json();
                setGroups(data);
            } catch (e) {
                console.error(e);
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEditorialGroups();
    }, [categoryIds]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Resultados por categoría</h2>

            {loading && <p>Cargando resultados…</p>}

            {!loading && groups.length === 0 && (
                <p>No hay resultados para las categorías seleccionadas.</p>
            )}

            {!loading &&
                groups.map(group => (
                    <section
                        key={group.categoryId}
                        className={styles.categorySection}
                    >
                        <h3 className={styles.categoryTitle}>
                            {group.categoryTitle}
                        </h3>

                        <div className={styles.grid}>
                            {group.recommendations.map(rec => (
                                <div
                                    key={rec.id}
                                    className={styles.card}
                                >
                                    <img
                                        src={
                                            rec.mainImage
                                                ? `http://localhost:8080/uploads/categories/${rec.mainImage}`
                                                : "/placeholder.jpg"
                                        }
                                        alt={rec.title}
                                        className={styles.image}
                                    />

                                    <div className={styles.body}>
                                        <h4 className={styles.route}>
                                            {rec.title}
                                        </h4>

                                        {rec.price && (
                                            <p className={styles.price}>
                                                Desde{" "}
                                                <strong>
                                                    ${rec.price.toLocaleString()}
                                                </strong>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
        </div>
    );
};

export default CategoryResultsPage;
