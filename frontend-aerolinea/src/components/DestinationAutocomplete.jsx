import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8080/api";

export default function DestinationAutocomplete({
  origin,
  value,
  onChange,
  onSelect,
  placeholder = "Ciudad",
  className = "",
  inputProps = {},
}) {
  const [q, setQ] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sugs, setSugs] = useState([]);
  const [hi, setHi] = useState(-1);
  const [allCities, setAllCities] = useState([]);
  const [debouncedQ, setDebouncedQ] = useState(q);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQ(value || "");
  }, [value]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/cities`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const cityNames = Array.isArray(data)
          ? data
              .map((city) => city?.name)
              .filter(Boolean)
              .map((city) => city.trim())
              .filter((city) => city.length > 0)
          : [];

        setAllCities([...new Set(cityNames)]);
      } catch (error) {
        console.error("Error al obtener ciudades", error);
        setAllCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQ(q);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [q]);

  useEffect(() => {
    const term = (debouncedQ || "").trim();

    if (term.length < 2) {
      setSugs([]);
      setHi(-1);
      return;
    }

    const normalize = (text = "") =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const matches = allCities
      .filter((city) => !origin || normalize(city) !== normalize(origin))
      .filter((city) => normalize(city).includes(normalize(term)))
      .slice(0, 8);

    setSugs(matches);
    setHi(-1);
  }, [debouncedQ, allCities, origin]);

  const select = (text) => {
    onChange?.(text);
    setQ(text);
    setOpen(false);
    setHi(-1);
    onSelect?.(text);
    inputRef.current?.blur();
  };

  const onKeyDown = (event) => {
    if (
      !open &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHi((previous) => Math.min(previous + 1, sugs.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHi((previous) => Math.max(previous - 1, 0));
    } else if (event.key === "Enter") {
      if (hi >= 0 && hi < sugs.length) {
        event.preventDefault();
        select(sugs[hi]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const highlight = (text, term) => {
    const index = text.toLowerCase().indexOf(term.toLowerCase());

    if (index === -1) {
      return text;
    }

    return (
      <>
        {text.substring(0, index)}
        <strong>{text.substring(index, index + term.length)}</strong>
        {text.substring(index + term.length)}
      </>
    );
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.5,
            fontSize: 14,
          }}
        >
          ✈️
        </span>

        <input
          ref={inputRef}
          type="text"
          value={q}
          placeholder={placeholder}
          onChange={(event) => {
            setQ(event.target.value);
            onChange?.(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={className}
          style={{ paddingLeft: 32 }}
          {...inputProps}
        />
      </div>

      {open && (
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
            boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
          }}
        >
          {loading && (
            <div style={{ padding: 10, fontSize: 14, color: "#666" }}>
              Buscando destinos…
            </div>
          )}

          {!loading && q.length < 2 && (
            <div style={{ padding: 10, fontSize: 13, color: "#aaa" }}>
              Escribí al menos 2 letras...
            </div>
          )}

          {!loading && sugs.length === 0 && q.length >= 2 && (
            <div style={{ padding: 10, fontSize: 14, color: "#888" }}>
              No se encontraron destinos
            </div>
          )}

          {!loading &&
            sugs.map((city, index) => (
              <div
                key={city}
                onMouseDown={() => select(city)}
                onMouseEnter={() => setHi(index)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background: hi === index ? "#eaf4ff" : "white",
                  borderTop: "1px solid #eee",
                  transition: "background 0.15s ease",
                }}
              >
                {highlight(city, q)}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}