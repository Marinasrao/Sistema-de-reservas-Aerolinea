import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8080/api";

export default function DestinationAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Ciudad de destino",
    className = "",
    inputProps = {}
}) {
    const [q, setQ] = useState(value || "");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sugs, setSugs] = useState([]);
    const [hi, setHi] = useState(-1);
    const wrapRef = useRef(null);

    const [allCities, setAllCities] = useState([]);

    useEffect(() => { setQ(value || ""); }, [value]);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/flights/search/cities`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const cities = await res.json();
                setAllCities(cities || []);
            } catch (err) {
                console.error("Error al obtener ciudades únicas", err);
                setAllCities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
    }, []);

    const [debouncedQ, setDebouncedQ] = useState(q);
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQ(q), 200);
        return () => clearTimeout(id);
    }, [q]);

    useEffect(() => {
        const term = (debouncedQ || "").trim();
        if (term.length < 2) {
            setSugs([]);
            return;
        }

        const normalize = str =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const matches = allCities
            .filter(city =>
                normalize(city).includes(normalize(term))
            )
            .slice(0, 8);

        setSugs(matches);
    }, [debouncedQ, allCities]);

    const select = (text) => {
        onChange?.(text);
        setQ(text);
        setOpen(false);
        setHi(-1);
        onSelect?.(text);
    };

    const onKeyDown = (e) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((prev) => Math.min(prev + 1, sugs.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            if (hi >= 0 && hi < sugs.length) {
                e.preventDefault();
                select(sugs[hi]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
            <input
                type="text"
                value={q}
                placeholder={placeholder}
                onChange={(e) => {
                    setQ(e.target.value);
                    onChange?.(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                className={className}
                {...inputProps}
            />
            {open && (loading || sugs.length > 0) && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 30,
                        background: "white",
                        border: "1px solid #ddd",
                        borderTop: "none",
                        maxHeight: 240,
                        overflowY: "auto",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.08)"
                    }}
                >
                    {loading && (
                        <div style={{ padding: 10, fontSize: 14, color: "#666" }}>
                            Buscando destinos…
                        </div>
                    )}
                    {!loading && sugs.map((s, idx) => (
                        <div
                            key={s}
                            onMouseDown={() => select(s)}
                            onMouseEnter={() => setHi(idx)}
                            style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                background: hi === idx ? "#f6f6f6" : "white",
                                borderTop: "1px solid #eee"
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
