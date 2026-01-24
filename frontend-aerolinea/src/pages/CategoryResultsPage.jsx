import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./CategoryResultsPage.module.css";

const API_BASE = "http://localhost:8080/api";

const CategoryResultsPage = () => {
    const [searchParams] = useSearchParams();
    const categoryIdsParam = searchParams.get("categories");

    const [categories, setCategories] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoryIds = categoryIdsParam
        ? categoryIdsParam.split(",").map(Number)
        : [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, flightRes] = await Promise.all([
                    fetch(`${API_BASE}/categories`),
                    fetch(`${API_BASE}/flights`)
                ]);

                const cats = await catRes.json();
                const fls = await flightRes.json();

                setCategories(Array.isArray(cats) ? cats : []);
                setFlights(Array.isArray(fls) ? fls : []);
            } catch (e) {
                console.error("Error cargando resultados por categoría", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Categorías seleccionadas según la URL
    const selectedCategories = categories.filter(cat =>
        categoryIds.includes(cat.id)
    );


    const selectedCategoryTitles = selectedCategories.map(cat => cat.title);

    // Filtro base por categoría (REAL)
    let filteredFlights = flights.filter(flight =>
        flight.categoryTitle &&
        selectedCategoryTitles.includes(flight.categoryTitle)
    );

    //Filtro Low-Cost
    const hasLowCost = selectedCategoryTitles.some(title =>
        title.toLowerCase().includes("low")
    );

    if (hasLowCost) {
        filteredFlights = filteredFlights.filter(flight =>
            (flight.origin === "Buenos Aires" && flight.destination === "Córdoba") ||
            (flight.origin === "Córdoba" && flight.destination === "Buenos Aires")
        );
    }

    const hasPremium = selectedCategoryTitles.some(title =>
        title.toLowerCase().includes("premium")
    );

    if (hasPremium) {
        filteredFlights = filteredFlights.filter(flight =>
            ["París", "Dubai", "Dubái"].includes(flight.destination)
        );
    }




    // Título dinámico

    const categoryTitles = selectedCategories.length
        ? selectedCategories.map(cat => cat.title)
        : ["Categoría seleccionada"];

    const titleText =
        categoryTitles.length === 1
            ? `Vuelos ${categoryTitles[0]}`
            : `Vuelos ${categoryTitles.join(" y ")}`;


   return (
    <div className={styles.container}>
        <h2 className={styles.title}>{titleText}</h2>

        <p className={styles.counter}>
            Mostrando {filteredFlights.length} vuelos
        </p>

        {!loading && filteredFlights.length === 0 && (
            <p>No se encontraron vuelos para estas categorías.</p>
        )}

        <div className={styles.list}>
            {filteredFlights.map(flight => (
                <div key={flight.id} className={styles.card}>
                    <h4>{flight.flightNumber}</h4>
                    <p>{flight.origin} → {flight.destination}</p>
                </div>
            ))}
        </div>
    </div>
)
};
export default CategoryResultsPage;
