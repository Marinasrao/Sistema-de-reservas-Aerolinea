import { useEffect, useState } from "react";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import planeBg from "../assets/avion.png";
import {
  createOnlineReservationPassengers,
  getAvailableSeats,
} from "../services/api";

const API_BASE = "http://localhost:8080/api";

const getStoredToken = () => {
  try {
    const storedAuth = localStorage.getItem("auth");

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);

      return (
        parsedAuth?.token ||
        parsedAuth?.jwt ||
        parsedAuth?.accessToken ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken") ||
        ""
      );
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  } catch {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }
};

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const buildCheckoutForm = (reservationData) => {
  const count = Math.max(1, Number(reservationData?.passengers) || 1);

  return {
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    contactDocument: "",

    passengers: Array.from({ length: count }, () => ({
      firstName: "",
      lastName: "",
      documentNumber: "",
      email: "",
      departureSeat: "",
      returnSeat: "",
    })),

    paymentMethod: "credit",
    cardHolder: "",
    cardDocument: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
    acceptedTerms: false,
  };
};

const ProfilePage = ({ auth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth?.user;

  const [activeSection, setActiveSection] = useState("profile");

  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutReservation, setCheckoutReservation] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [seatAvailability, setSeatAvailability] = useState({
    departure: [],
    return: [],
  });
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    if (location.state?.activeSection === "reservas") {
      setActiveSection("reservas");
    }
  }, [location.state]);

  useEffect(() => {
    if (!user?.email) return;

    try {
      const storageKey = `reservations_${user.email}`;
      const savedReservations = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );

      setReservations(
        Array.isArray(savedReservations) ? savedReservations : [],
      );
    } catch {
      setReservations([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    try {
      const pendingReservation = JSON.parse(
        localStorage.getItem("pendingReservation") || "null",
      );

      if (!pendingReservation) return;

      if (
        pendingReservation.userEmail &&
        pendingReservation.userEmail !== user.email
      ) {
        return;
      }

      setCheckoutReservation(pendingReservation);
      setCheckoutForm(buildCheckoutForm(pendingReservation));
      setCheckoutError("");
      setCheckoutOpen(true);
      setActiveSection("profile");

      localStorage.removeItem("pendingReservation");
    } catch {
      localStorage.removeItem("pendingReservation");
    }
  }, [user?.email, location.key]);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const token = getStoredToken();

      if (!token) {
        setFavorites([]);
        setLoadingFavorites(false);
        return;
      }

      try {
        setLoadingFavorites(true);
        setFavoritesError("");

        const res = await fetch(`${API_BASE}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No se pudieron cargar los favoritos");
        }

        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        setFavorites([]);
        setFavoritesError("No pudimos cargar tus favoritos en este momento.");
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/recommendations`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron cargar las recomendaciones");
        }

        return res.json();
      })
      .then((data) => {
        setRecommendations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setRecommendations([]);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!checkoutOpen || !checkoutReservation?.selectedDepartureFlight?.id) {
      setSeatAvailability({
        departure: [],
        return: [],
      });
      return;
    }

    let cancelled = false;

    const loadAvailableSeats = async () => {
      const flightClass = String(
        checkoutReservation.flightClass || "economy",
      ).toUpperCase();

      const departureFlightId = checkoutReservation.selectedDepartureFlight.id;
      const returnFlightId = checkoutReservation.selectedReturnFlight?.id;

      const hasReturnFlight = Boolean(
        checkoutReservation.returnDate && returnFlightId,
      );

      try {
        setLoadingSeats(true);

        const [departureSeats, returnSeats] = await Promise.all([
          getAvailableSeats(departureFlightId, flightClass),
          hasReturnFlight
            ? getAvailableSeats(returnFlightId, flightClass)
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        setSeatAvailability({
          departure: Array.isArray(departureSeats) ? departureSeats : [],
          return: Array.isArray(returnSeats) ? returnSeats : [],
        });
      } catch (error) {
        console.error("Error cargando asientos disponibles:", error);

        if (!cancelled) {
          setSeatAvailability({
            departure: [],
            return: [],
          });

          setCheckoutError(
            "No pudimos cargar los asientos disponibles. Cerrá y volvé a abrir la reserva.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSeats(false);
        }
      }
    };

    loadAvailableSeats();

    return () => {
      cancelled = true;
    };
  }, [checkoutOpen, checkoutReservation]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

  const classLabels = {
    economy: "Económica",
    business: "Ejecutiva",
    first: "Primera",
  };

  const normalizeFlightClass = (value) => {
    const normalized = String(value || "economy")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (
      normalized === "first" ||
      normalized === "primera" ||
      normalized === "first_class"
    ) {
      return "first";
    }

    if (
      normalized === "business" ||
      normalized === "ejecutiva" ||
      normalized === "executive"
    ) {
      return "business";
    }

    return "economy";
  };

  const getFlightClassLabel = (value) => {
    return classLabels[normalizeFlightClass(value)];
  };

  const classMultipliers = {
    economy: 1,
    business: 1.6,
    first: 2.2,
  };

  const getFlightPriceByClass = (flight, flightClassValue) => {
    const basePrice = Number(flight?.price);

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return 0;
    }

    const normalizedClass = normalizeFlightClass(flightClassValue);
    const multiplier = classMultipliers[normalizedClass] || 1;

    return Math.round(basePrice * multiplier);
  };

  const formatDate = (date) => {
    if (!date) return "Sin fecha";

    return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR");
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return "A confirmar";
    }

    return `AR$ ${numericPrice.toLocaleString("es-AR")}`;
  };

  const getFlightName = (flight) => {
    if (!flight) return "Vuelo no registrado";

    const airline = flight.airline || "Aerolínea";
    const flightNumber = flight.flightNumber ? ` · ${flight.flightNumber}` : "";

    return `${airline}${flightNumber}`;
  };

  const getFlightSchedule = (flight) => {
    if (!flight) return "Horario no registrado";

    const departureTime = flight.departureTime || "--:--";
    const arrivalTime = flight.arrivalTime || "--:--";

    return `${departureTime} → ${arrivalTime}`;
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);

    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiration = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const sanitizeName = (value) => {
    return String(value || "")
      .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50);
  };

  const sanitizeDocument = (value) => {
    return String(value || "")
      .replace(/\D/g, "")
      .slice(0, 10);
  };

  const sanitizePhone = (value) => {
    return String(value || "")
      .replace(/\D/g, "")
      .slice(0, 15);
  };

  const sanitizeEmail = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .slice(0, 80);
  };

  const isValidName = (value) => {
    const cleanValue = String(value || "").trim();

    return (
      cleanValue.length >= 2 &&
      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(
        cleanValue,
      )
    );
  };

  const isValidDocument = (value) => {
    return /^\d{7,10}$/.test(String(value || "").trim());
  };

  const isValidPhone = (value) => {
    return /^\d{8,15}$/.test(String(value || "").trim());
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  };

  const sanitizeCheckoutValue = (field, value) => {
    if (
      field === "contactFirstName" ||
      field === "contactLastName" ||
      field === "cardHolder"
    ) {
      return sanitizeName(value);
    }

    if (field === "contactDocument" || field === "cardDocument") {
      return sanitizeDocument(value);
    }

    if (field === "contactPhone") {
      return sanitizePhone(value);
    }

    if (field === "contactEmail") {
      return sanitizeEmail(value);
    }

    if (field === "cardNumber") {
      return formatCardNumber(value);
    }

    if (field === "expiration") {
      return formatExpiration(value);
    }

    if (field === "cvv") {
      return String(value || "")
        .replace(/\D/g, "")
        .slice(0, 4);
    }

    return value;
  };

  const sanitizePassengerValue = (field, value) => {
    if (field === "firstName" || field === "lastName") {
      return sanitizeName(value);
    }

    if (field === "documentNumber") {
      return sanitizeDocument(value);
    }

    if (field === "email") {
      return sanitizeEmail(value);
    }

    return value;
  };

  const handleCheckoutFieldChange = (field, value) => {
    setCheckoutForm((previous) => ({
      ...previous,
      [field]: sanitizeCheckoutValue(field, value),
    }));

    setCheckoutError("");
  };

  const handleCheckoutPassengerChange = (index, field, value) => {
    setCheckoutForm((previous) => ({
      ...previous,
      passengers: previous.passengers.map((passenger, passengerIndex) =>
        passengerIndex === index
          ? {
              ...passenger,
              [field]: sanitizePassengerValue(field, value),
            }
          : passenger,
      ),
    }));

    setCheckoutError("");
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutReservation(null);
    setCheckoutForm(null);
    setCheckoutError("");
    setProcessingPayment(false);
  };

  const handleConfirmPayment = (event) => {
    event?.preventDefault();

    if (!checkoutReservation || !checkoutForm || !user) {
      return;
    }

    if (
      !isValidName(checkoutForm.contactFirstName) ||
      !isValidName(checkoutForm.contactLastName)
    ) {
      setCheckoutError(
        "Ingresá un nombre y apellido válidos para la persona responsable. Solo se permiten letras.",
      );
      return;
    }

    if (!isValidEmail(checkoutForm.contactEmail)) {
      setCheckoutError("Ingresá un correo electrónico válido.");
      return;
    }

    if (!isValidPhone(checkoutForm.contactPhone)) {
      setCheckoutError(
        "Ingresá un teléfono válido. Debe contener entre 8 y 15 números.",
      );
      return;
    }

    if (!isValidDocument(checkoutForm.contactDocument)) {
      setCheckoutError(
        "Ingresá un documento válido para la persona responsable. Debe contener entre 7 y 10 números.",
      );
      return;
    }

    const invalidPassenger = checkoutForm.passengers.find(
      (passenger) =>
        !isValidName(passenger.firstName) ||
        !isValidName(passenger.lastName) ||
        !isValidDocument(passenger.documentNumber),
    );

    if (invalidPassenger) {
      setCheckoutError(
        "Revisá los datos de pasajeros. Nombre y apellido solo aceptan letras, y el documento debe tener entre 7 y 10 números.",
      );
      return;
    }

    const invalidPassengerEmail = checkoutForm.passengers.find(
      (passenger) => passenger.email.trim() && !isValidEmail(passenger.email),
    );

    if (invalidPassengerEmail) {
      setCheckoutError(
        "Revisá el email opcional de los pasajeros. El formato ingresado no es válido.",
      );
      return;
    }

    const missingSeat = checkoutForm.passengers.some(
      (passenger) =>
        !passenger.departureSeat ||
        (checkoutReservation.returnDate && !passenger.returnSeat),
    );

    if (missingSeat) {
      setCheckoutError(
        "Elegí un asiento de ida y, si corresponde, de vuelta para cada pasajero.",
      );
      return;
    }

    const cardDigits = checkoutForm.cardNumber.replace(/\D/g, "");

    if (!isValidName(checkoutForm.cardHolder)) {
      setCheckoutError(
        "Ingresá un nombre válido para la persona titular de la tarjeta. Solo se permiten letras.",
      );
      return;
    }

    if (!isValidDocument(checkoutForm.cardDocument)) {
      setCheckoutError(
        "Ingresá un documento válido para la persona titular de la tarjeta. Debe contener entre 7 y 10 números.",
      );
      return;
    }

    if (cardDigits.length !== 16) {
      setCheckoutError("Ingresá los 16 dígitos de tu tarjeta para continuar.");
      return;
    }

    if (
      !/^\d{2}\/\d{2}$/.test(checkoutForm.expiration) ||
      !/^\d{3,4}$/.test(checkoutForm.cvv)
    ) {
      setCheckoutError(
        "Completá el vencimiento (MM/AA) y el código de seguridad de la tarjeta.",
      );
      return;
    }

    if (!checkoutForm.acceptedTerms) {
      setCheckoutError(
        "Aceptá los términos y condiciones para confirmar el pago.",
      );
      return;
    }

    setProcessingPayment(true);

    window.setTimeout(async () => {
      const selectedFlightClass = normalizeFlightClass(
        checkoutReservation.flightClass,
      );

      const departurePrice = getFlightPriceByClass(
        checkoutReservation.selectedDepartureFlight,
        selectedFlightClass,
      );

      const returnPrice = getFlightPriceByClass(
        checkoutReservation.selectedReturnFlight,
        selectedFlightClass,
      );

      const passengerCount = Number(checkoutReservation.passengers) || 1;
      const hasReturnFlight = Boolean(checkoutReservation.returnDate);

      const totalPrice =
        (departurePrice + (hasReturnFlight ? returnPrice : 0)) * passengerCount;

      const flightClass = selectedFlightClass.toUpperCase();
      const reservationCode = `FB-${Date.now().toString().slice(-6)}`;
      const onlinePassengers = checkoutForm.passengers.flatMap((passenger) => {
        const passengerData = {
          firstName: passenger.firstName.trim(),
          lastName: passenger.lastName.trim(),
          documentNumber: passenger.documentNumber.trim(),
          email: passenger.email.trim() || null,
          phone: checkoutForm.contactPhone.trim(),
          flightClass,
        };

        const departurePassenger = {
          ...passengerData,
          flightId: checkoutReservation.selectedDepartureFlight.id,
          seatNumber: passenger.departureSeat,
        };

        if (!hasReturnFlight) {
          return [departurePassenger];
        }

        return [
          departurePassenger,
          {
            ...passengerData,
            flightId: checkoutReservation.selectedReturnFlight.id,
            seatNumber: passenger.returnSeat,
          },
        ];
      });

      const reservationPayload = {
        reservationCode,
        origin: checkoutReservation.origin || "No especificado",
        destination: checkoutReservation.destination || "No especificado",
        departureDate: checkoutReservation.departureDate || "",
        returnDate: checkoutReservation.returnDate || "",
        flightClass,
        totalPrice,
        passengers: onlinePassengers,
      };

      let savedOnlinePassengers;

      try {
        savedOnlinePassengers =
          await createOnlineReservationPassengers(reservationPayload);
      } catch (error) {
        console.error("Error confirmando pasajeros online:", error);

        setProcessingPayment(false);
        setCheckoutError(
          error?.message ||
            "No pudimos confirmar los asientos. Puede que alguno se haya ocupado; elegí otro disponible.",
        );

        return;
      }

      const holderName =
        `${checkoutForm.contactFirstName} ${checkoutForm.contactLastName}`.trim();

      const newReservation = {
        id: Date.now(),
        reservationCode,
        reservationDate: new Date().toISOString(),
        userEmail: user.email,
        holderName,
        contactEmail: checkoutForm.contactEmail.trim(),
        contactPhone: checkoutForm.contactPhone.trim(),
        contactDocument: checkoutForm.contactDocument.trim(),
        origin: checkoutReservation.origin || "No especificado",
        destination: checkoutReservation.destination || "No especificado",
        departureDate: checkoutReservation.departureDate || "",
        returnDate: checkoutReservation.returnDate || "",
        passengers: passengerCount,
        flightClass: selectedFlightClass,
        departureFlight: checkoutReservation.selectedDepartureFlight || null,
        returnFlight: hasReturnFlight
          ? checkoutReservation.selectedReturnFlight || null
          : null,
        departurePrice,
        returnPrice: hasReturnFlight ? returnPrice : 0,
        totalPrice,
        passengerDetails: checkoutForm.passengers,
        onlinePassengerIds: Array.isArray(savedOnlinePassengers)
          ? savedOnlinePassengers.map((passenger) => passenger.id)
          : [],
        paymentMethod: checkoutForm.paymentMethod,
        cardLastFour: cardDigits.slice(-4),
        paymentStatus: "Pago aprobado",
        status: "Reserva confirmada",
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      };

      const storageKey = `reservations_${user.email}`;
      const savedReservations = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );

      const updatedReservations = [newReservation, ...savedReservations];

      localStorage.setItem(storageKey, JSON.stringify(updatedReservations));
      localStorage.setItem(
        "lastConfirmedReservation",
        JSON.stringify(newReservation),
      );

      setReservations(updatedReservations);

      closeCheckout();

      navigate("/reservation-confirmation", {
        state: {
          reservation: newReservation,
        },
      });
    }, 850);
  };

  const handleRemoveFavorite = async (recommendationId) => {
    const token = getStoredToken();

    if (!token) return;

    try {
      setFavoritesError("");

      const res = await fetch(`${API_BASE}/favorites/${recommendationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el favorito");
      }

      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      setFavoritesError(
        "No pudimos eliminar este favorito. Intentá nuevamente.",
      );
    }
  };

  const handleRemoveReservation = (reservationId) => {
    const storageKey = `reservations_${user.email}`;

    const updatedReservations = reservations.filter(
      (reservation) => reservation.id !== reservationId,
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedReservations));
    setReservations(updatedReservations);
  };

  const findRecommendationForReservation = (reservation) => {
    if (!reservation) return null;

    const reservationOrigin = normalizeText(reservation.origin);
    const reservationDestination = normalizeText(reservation.destination);

    return recommendations.find((rec) => {
      const recDestination = normalizeText(rec.destination);
      const recTitle = normalizeText(rec.title);
      const recOrigin = normalizeText(rec.origin);

      return (
        recDestination === reservationDestination ||
        recTitle === reservationDestination ||
        recOrigin === reservationOrigin ||
        recDestination === reservationOrigin ||
        recTitle === reservationOrigin ||
        recDestination.includes(reservationDestination) ||
        reservationDestination.includes(recDestination) ||
        recTitle.includes(reservationDestination) ||
        reservationDestination.includes(recTitle) ||
        recDestination.includes(reservationOrigin) ||
        reservationOrigin.includes(recDestination) ||
        recTitle.includes(reservationOrigin) ||
        reservationOrigin.includes(recTitle)
      );
    });
  };

  const openReviewModal = (reservation) => {
    setSelectedReservation(reservation);
    setSelectedRating(0);
    setReviewComment("");
    setReviewMessage("");
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReservation(null);
    setSelectedRating(0);
    setReviewComment("");
    setReviewMessage("");
    setSavingReview(false);
  };

  const handleSubmitReview = async () => {
    if (!selectedReservation) {
      setReviewMessage("No pudimos identificar la reserva seleccionada.");
      return;
    }

    if (!selectedRating) {
      setReviewMessage("Seleccioná una puntuación de 1 a 5 estrellas.");
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setReviewMessage(
        "No pudimos validar tu sesión. Iniciá sesión nuevamente.",
      );
      return;
    }

    const recommendation =
      findRecommendationForReservation(selectedReservation);

    if (!recommendation?.id) {
      setReviewMessage(
        "No encontramos el destino asociado a esta reserva para poder puntuarlo.",
      );
      return;
    }

    try {
      setSavingReview(true);
      setReviewMessage("");

      const res = await fetch(
        `${API_BASE}/reviews/recommendation/${recommendation.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
            comment: reviewComment.trim(),
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo guardar la valoración.");
      }

      const reviewedAt = new Date().toISOString();

      const updatedReservations = reservations.map((reservation) =>
        reservation.id === selectedReservation.id
          ? {
              ...reservation,
              reviewed: true,
              reviewedAt,
              reviewRating: selectedRating,
              reviewComment: reviewComment.trim(),
            }
          : reservation,
      );

      const storageKey = `reservations_${user.email}`;

      localStorage.setItem(storageKey, JSON.stringify(updatedReservations));
      setReservations(updatedReservations);

      localStorage.setItem(
        "lastConfirmedReservation",
        JSON.stringify(
          updatedReservations.find(
            (reservation) => reservation.id === selectedReservation.id,
          ) || selectedReservation,
        ),
      );

      setReviewMessage("Tu valoración fue publicada correctamente.");

      setTimeout(() => {
        closeReviewModal();
        setReservationMessage(
          "Gracias por puntuar tu destino. Ya quedó marcado como puntuado.",
        );
        setActiveSection("historial");

        setTimeout(() => {
          setReservationMessage("");
        }, 3500);
      }, 1200);
    } catch (error) {
      setReviewMessage(error.message || "No se pudo guardar la valoración.");
    } finally {
      setSavingReview(false);
    }
  };

  const getReservationDate = (reservation) =>
    reservation?.reservationDate ||
    reservation?.createdAt ||
    reservation?.purchasedAt ||
    reservation?.confirmedAt ||
    reservation?.date ||
    "";

  const buildReservationDate = (value) => {
    if (!value) return null;

    const rawDate = String(value);
    const parsedDate = rawDate.includes("T")
      ? new Date(rawDate)
      : new Date(`${rawDate}T00:00:00`);

    return Number.isFinite(parsedDate.getTime()) ? parsedDate : null;
  };

  const getReservationDateLabel = (reservation) => {
    const reservationDate = buildReservationDate(
      getReservationDate(reservation),
    );

    return reservationDate
      ? reservationDate.toLocaleDateString("es-AR")
      : "Fecha no informada";
  };

  const getReservationDateValue = (reservation) => {
    const reservationDate = buildReservationDate(
      getReservationDate(reservation),
    );

    return reservationDate ? reservationDate.getTime() : 0;
  };

  const sortedReservations = [...reservations].sort(
    (a, b) => getReservationDateValue(b) - getReservationDateValue(a),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTripEndDate = (reservation) => {
    const finalDate = reservation?.returnDate || reservation?.departureDate;

    return buildReservationDate(finalDate);
  };

  const isPastTrip = (reservation) => {
    const tripEndDate = getTripEndDate(reservation);

    if (!tripEndDate) {
      return false;
    }

    tripEndDate.setHours(0, 0, 0, 0);

    return tripEndDate < today;
  };

  const upcomingReservations = sortedReservations.filter(
    (reservation) => !isPastTrip(reservation),
  );

  const travelHistory = sortedReservations.filter((reservation) =>
    isPastTrip(reservation),
  );

  const pendingReviews = travelHistory.filter(
    (reservation) => !reservation.reviewed,
  );

  const openReservationDetail = (reservation) => {
    localStorage.setItem(
      "lastConfirmedReservation",
      JSON.stringify(reservation),
    );

    navigate("/reservation-confirmation", {
      state: {
        reservation,
      },
    });
  };

  return (
    <div className={styles.profileLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{initials}</div>

        <div className={styles.userInfo}>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
        </div>

        <nav className={styles.menu}>
          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "profile" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            Mi perfil
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "reservas" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("reservas")}
          >
            Mis viajes
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "historial" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("historial")}
          >
            Historial de viajes
          </button>

          <button
            type="button"
            className={`${styles.menuItem} ${
              activeSection === "favoritos" ? styles.menuItemActive : ""
            }`}
            onClick={() => setActiveSection("favoritos")}
          >
            Mis favoritos
          </button>
        </nav>
      </aside>

      <section className={styles.rightBlock}>
        <div
          className={styles.bgPlane}
          style={{ backgroundImage: `url(${planeBg})` }}
        />

        <div className={styles.overlay}>
          <div className={styles.profileContent}>
            {reservationMessage && (
              <div className={styles.favoriteMessage}>{reservationMessage}</div>
            )}

            {activeSection === "profile" && (
              <section className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Panel personal
                    </span>
                    <h3>Mi perfil</h3>
                  </div>
                </div>

                {pendingReviews.length > 0 && (
                  <button
                    type="button"
                    className={styles.reviewAlert}
                    onClick={() => setActiveSection("historial")}
                  >
                    <span className={styles.reviewAlertIcon}>🔔</span>

                    <div>
                      <strong>
                        Tenés {pendingReviews.length}{" "}
                        {pendingReviews.length === 1
                          ? "viaje pendiente de puntuar"
                          : "viajes pendientes de puntuar"}
                      </strong>

                      <p>
                        Entrá al historial para valorar tus destinos y compartir
                        tu experiencia.
                      </p>
                    </div>
                  </button>
                )}

                <div className={styles.profileSummaryGrid}>
                  <article className={styles.profileSummaryCard}>
                    <span>Reservas</span>
                    <strong>{reservations.length}</strong>
                    <p>Viajes guardados en tu perfil.</p>

                    <button
                      type="button"
                      onClick={() => setActiveSection("reservas")}
                    >
                      Ver reservas
                    </button>
                  </article>

                  <article className={styles.profileSummaryCard}>
                    <span>Favoritos</span>
                    <strong>{favorites.length}</strong>
                    <p>Destinos que guardaste para revisar después.</p>

                    <button
                      type="button"
                      onClick={() => setActiveSection("favoritos")}
                    >
                      Ver favoritos
                    </button>
                  </article>

                  <article className={styles.profileSummaryCard}>
                    <span>Valoraciones</span>
                    <strong>{pendingReviews.length}</strong>

                    <p>
                      {pendingReviews.length > 0
                        ? "Tenés destinos pendientes de puntuar en tu historial."
                        : "No tenés destinos pendientes de puntuar."}
                    </p>

                    <button type="button" onClick={() => setActiveSection("historial")}>
                      Ver historial
                    </button>
                  </article>
                </div>
              </section>
            )}

            {activeSection === "reservas" && (
              <section id="reservas" className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Viajes seleccionados
                    </span>
                    <h3>Mis viajes</h3>
                  </div>

                  <div className={styles.favoritesActions}>
                    <span className={styles.favoritesCount}>
                      {upcomingReservations.length}{" "}
                      {upcomingReservations.length === 1
                        ? "viaje próximo"
                        : "viajes próximos"}
                    </span>

                    <Link to="/" className={styles.continueButton}>
                      Buscar otro viaje
                    </Link>
                  </div>
                </div>

                {upcomingReservations.length === 0 ? (
                  <div className={styles.emptyFavorites}>
                    <h4>Todavía no tenés reservas</h4>
                    <p>
                      Elegí un destino, seleccioná fechas disponibles y confirmá
                      tu reserva para verla reflejada acá.
                    </p>

                    <Link to="/" className={styles.emptyAction}>
                      Buscar vuelos
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {upcomingReservations.map((reservation) => {
                      const hasReturnReservation = Boolean(
                        reservation.returnDate,
                      );
                      const passengerDetails = Array.isArray(
                        reservation.passengerDetails,
                      )
                        ? reservation.passengerDetails
                        : [];

                      return (
                        <article
                          key={reservation.id}
                          className={styles.reservationCard}
                        >
                          <div className={styles.reservationTopRow}>
                            <div>
                              <span className={styles.favoriteBadge}>
                                {reservation.status || "Reserva confirmada"}
                              </span>

                              <h4>
                                {reservation.origin} → {reservation.destination}
                              </h4>

                              <p className={styles.reservationSubtitle}>
                                {hasReturnReservation
                                  ? "Viaje de ida y vuelta"
                                  : "Viaje solo ida"}{" "}
                                · {getFlightClassLabel(reservation.flightClass)}
                              </p>
                            </div>

                            {reservation.reservationCode && (
                              <span className={styles.reservationCode}>
                                {reservation.reservationCode}
                              </span>
                            )}
                          </div>

                          <div className={styles.reservationStatusRow}>
                            <span>
                              {reservation.paymentStatus || "Pago aprobado"}
                            </span>
                            <strong>
                              Total: {formatPrice(reservation.totalPrice)}
                            </strong>
                          </div>

                          <div className={styles.reservationInfoGrid}>
                            <div>
                              <span>Producto reservado</span>
                              <strong>
                                Vuelo {reservation.origin} →{" "}
                                {reservation.destination}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de reserva</span>
                              <strong>
                                {getReservationDateLabel(reservation)}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de uso - ida</span>
                              <strong>
                                {formatDate(reservation.departureDate)}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de uso - vuelta</span>
                              <strong>
                                {hasReturnReservation
                                  ? formatDate(reservation.returnDate)
                                  : "No requerida"}
                              </strong>
                            </div>

                            <div>
                              <span>Pasajeros</span>
                              <strong>
                                {reservation.passengers || 1}{" "}
                                {Number(reservation.passengers || 1) === 1
                                  ? "pasajero"
                                  : "pasajeros"}
                              </strong>
                            </div>

                            <div>
                              <span>Clase</span>
                              <strong>
                                {getFlightClassLabel(reservation.flightClass)}
                              </strong>
                            </div>
                          </div>

                          <div className={styles.reservationHolder}>
                            <span>Responsable de la reserva</span>
                            <strong>
                              {reservation.holderName ||
                                "Persona responsable no informada"}
                            </strong>
                            <p>
                              {reservation.contactEmail ||
                                reservation.userEmail}
                            </p>
                          </div>

                          <div className={styles.reservationFlights}>
                            <div className={styles.reservationFlightItem}>
                              <span className={styles.reservationFlightLabel}>
                                Vuelo de ida ·{" "}
                                {formatDate(reservation.departureDate)}
                              </span>

                              <strong>
                                {getFlightName(reservation.departureFlight)}
                              </strong>

                              <p>
                                {reservation.origin} → {reservation.destination}
                              </p>

                              <small>
                                {getFlightSchedule(reservation.departureFlight)}
                              </small>
                            </div>

                            {hasReturnReservation && (
                              <div className={styles.reservationFlightItem}>
                                <span className={styles.reservationFlightLabel}>
                                  Vuelo de vuelta ·{" "}
                                  {formatDate(reservation.returnDate)}
                                </span>

                                <strong>
                                  {getFlightName(reservation.returnFlight)}
                                </strong>

                                <p>
                                  {reservation.destination} →{" "}
                                  {reservation.origin}
                                </p>

                                <small>
                                  {getFlightSchedule(reservation.returnFlight)}
                                </small>
                              </div>
                            )}
                          </div>

                          {passengerDetails.length > 0 && (
                            <div className={styles.reservationPassengers}>
                              <span>Pasajeros y asientos</span>

                              <div className={styles.reservationPassengersList}>
                                {passengerDetails.map((passenger, index) => (
                                  <div
                                    key={`${
                                      passenger.documentNumber || index
                                    }-${index}`}
                                    className={styles.reservationPassengerItem}
                                  >
                                    <strong>
                                      {passenger.firstName} {passenger.lastName}
                                    </strong>

                                    <p>
                                      DNI/Pasaporte: {passenger.documentNumber}
                                    </p>

                                    <small>
                                      Ida:{" "}
                                      {passenger.departureSeat || "Sin asiento"}
                                      {hasReturnReservation &&
                                        ` · Vuelta: ${
                                          passenger.returnSeat || "Sin asiento"
                                        }`}
                                    </small>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={styles.reservationActions}>
                            <button
                              type="button"
                              className={styles.rateReservationButton}
                              onClick={() => openReservationDetail(reservation)}
                            >
                              Ver viaje
                            </button>
                            <div className={styles.reviewNotice}>
                              <span>🔔</span>
                              <p>
                                Podrás puntuar este destino cuando finalice tu
                                viaje.
                              </p>
                            </div>

                            <button
                              type="button"
                              className={styles.removeFavoriteButton}
                              onClick={() =>
                                handleRemoveReservation(reservation.id)
                              }
                            >
                              Quitar reserva
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeSection === "historial" && (
              <section id="historial" className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Viajes realizados
                    </span>
                    <h3>Historial de viajes</h3>
                  </div>

                  <div className={styles.favoritesActions}>
                    <span className={styles.favoritesCount}>
                      {travelHistory.length}{" "}
                      {travelHistory.length === 1
                        ? "viaje realizado"
                        : "viajes realizados"}
                    </span>

                    <Link to="/" className={styles.continueButton}>
                      Buscar otro viaje
                    </Link>
                  </div>
                </div>

                {travelHistory.length === 0 ? (
                  <div className={styles.emptyFavorites}>
                    <h4>Todavía no tenés viajes realizados</h4>
                    <p>
                      Cuando pase la fecha final de un vuelo reservado, el viaje
                      dejará de aparecer como próximo y se guardará
                      automáticamente en este historial.
                    </p>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {travelHistory.map((reservation) => {
                      const hasReturnReservation = Boolean(
                        reservation.returnDate,
                      );
                      const passengerDetails = Array.isArray(
                        reservation.passengerDetails,
                      )
                        ? reservation.passengerDetails
                        : [];

                      return (
                        <article
                          key={reservation.id}
                          className={styles.reservationCard}
                        >
                          <div className={styles.reservationTopRow}>
                            <div>
                              <span className={styles.favoriteBadge}>
                                Viaje realizado
                              </span>

                              <h4>
                                {reservation.origin} → {reservation.destination}
                              </h4>

                              <p className={styles.reservationSubtitle}>
                                {hasReturnReservation
                                  ? "Viaje de ida y vuelta"
                                  : "Viaje solo ida"}{" "}
                                · {getFlightClassLabel(reservation.flightClass)}
                              </p>
                            </div>

                            {reservation.reservationCode && (
                              <span className={styles.reservationCode}>
                                {reservation.reservationCode}
                              </span>
                            )}
                          </div>

                          <div className={styles.reservationStatusRow}>
                            <span>
                              {reservation.paymentStatus || "Pago aprobado"}
                            </span>
                            <strong>
                              Total: {formatPrice(reservation.totalPrice)}
                            </strong>
                          </div>

                          <div className={styles.reservationInfoGrid}>
                            <div>
                              <span>Producto reservado</span>
                              <strong>
                                Vuelo {reservation.origin} →{" "}
                                {reservation.destination}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de reserva</span>
                              <strong>
                                {getReservationDateLabel(reservation)}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de uso - ida</span>
                              <strong>
                                {formatDate(reservation.departureDate)}
                              </strong>
                            </div>

                            <div>
                              <span>Fecha de uso - vuelta</span>
                              <strong>
                                {hasReturnReservation
                                  ? formatDate(reservation.returnDate)
                                  : "No requerida"}
                              </strong>
                            </div>

                            <div>
                              <span>Pasajeros</span>
                              <strong>
                                {reservation.passengers || 1}{" "}
                                {Number(reservation.passengers || 1) === 1
                                  ? "pasajero"
                                  : "pasajeros"}
                              </strong>
                            </div>

                            <div>
                              <span>Clase</span>
                              <strong>
                                {getFlightClassLabel(reservation.flightClass)}
                              </strong>
                            </div>
                          </div>

                          <div className={styles.reservationHolder}>
                            <span>Responsable de la reserva</span>
                            <strong>
                              {reservation.holderName ||
                                "Persona responsable no informada"}
                            </strong>
                            <p>
                              {reservation.contactEmail ||
                                reservation.userEmail}
                            </p>
                          </div>

                          <div className={styles.reservationFlights}>
                            <div className={styles.reservationFlightItem}>
                              <span className={styles.reservationFlightLabel}>
                                Vuelo de ida ·{" "}
                                {formatDate(reservation.departureDate)}
                              </span>

                              <strong>
                                {getFlightName(reservation.departureFlight)}
                              </strong>

                              <p>
                                {reservation.origin} → {reservation.destination}
                              </p>

                              <small>
                                {getFlightSchedule(reservation.departureFlight)}
                              </small>
                            </div>

                            {hasReturnReservation && (
                              <div className={styles.reservationFlightItem}>
                                <span className={styles.reservationFlightLabel}>
                                  Vuelo de vuelta ·{" "}
                                  {formatDate(reservation.returnDate)}
                                </span>

                                <strong>
                                  {getFlightName(reservation.returnFlight)}
                                </strong>

                                <p>
                                  {reservation.destination} →{" "}
                                  {reservation.origin}
                                </p>

                                <small>
                                  {getFlightSchedule(reservation.returnFlight)}
                                </small>
                              </div>
                            )}
                          </div>

                          {passengerDetails.length > 0 && (
                            <div className={styles.reservationPassengers}>
                              <span>Pasajeros y asientos</span>

                              <div className={styles.reservationPassengersList}>
                                {passengerDetails.map((passenger, index) => (
                                  <div
                                    key={`${passenger.documentNumber || index}-${index}`}
                                    className={styles.reservationPassengerItem}
                                  >
                                    <strong>
                                      {passenger.firstName} {passenger.lastName}
                                    </strong>

                                    <p>
                                      DNI/Pasaporte: {passenger.documentNumber}
                                    </p>

                                    <small>
                                      Ida:{" "}
                                      {passenger.departureSeat || "Sin asiento"}
                                      {hasReturnReservation &&
                                        ` · Vuelta: ${
                                          passenger.returnSeat || "Sin asiento"
                                        }`}
                                    </small>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={styles.reservationActions}>
                            <button
                              type="button"
                              className={styles.rateReservationButton}
                              onClick={() => openReservationDetail(reservation)}
                            >
                              Ver detalle
                            </button>

                            {reservation.reviewed ? (
                              <div
                                className={`${styles.reviewNotice} ${styles.reviewNoticeDone}`}
                              >
                                <span>✓</span>

                                <p>
                                  Ya puntuaste este destino
                                  {reservation.reviewRating
                                    ? ` con ${reservation.reviewRating} estrellas.`
                                    : "."}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className={styles.reviewNotice}>
                                  <span>🔔</span>

                                  <p>
                                    Aún no puntuaste este destino del día{" "}
                                    {formatDate(reservation.departureDate)}.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  className={styles.rateReservationButton}
                                  onClick={() => openReviewModal(reservation)}
                                >
                                  Puntuar destino
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeSection === "favoritos" && (
              <section id="favoritos" className={styles.favoritesSection}>
                <div className={styles.favoritesHeader}>
                  <div>
                    <span className={styles.favoritesLabel}>
                      Selecciones guardadas
                    </span>
                    <h3>Mis favoritos</h3>
                  </div>

                  <div className={styles.favoritesActions}>
                    <span className={styles.favoritesCount}>
                      {favorites.length}{" "}
                      {favorites.length === 1 ? "destino" : "destinos"}
                    </span>

                    <Link to="/" className={styles.continueButton}>
                      Seguir eligiendo
                    </Link>
                  </div>
                </div>

                {loadingFavorites ? (
                  <p className={styles.emptyText}>Cargando favoritos...</p>
                ) : favoritesError ? (
                  <p className={styles.errorText}>{favoritesError}</p>
                ) : favorites.length === 0 ? (
                  <div className={styles.emptyFavorites}>
                    <h4>Todavía no guardaste favoritos</h4>
                    <p>
                      Marcá el corazón en las recomendaciones del Home y tus
                      destinos aparecerán acá.
                    </p>

                    <Link to="/" className={styles.emptyAction}>
                      Ver recomendaciones
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {favorites.map((rec) => {
                      const imageName = rec.mainImage || rec.imageUrl || null;

                      const imageSrc = imageName
                        ? `http://localhost:8080/uploads/recommendations/${imageName}`
                        : "/placeholder.jpg";

                      return (
                        <div key={rec.id} className={styles.favoriteCard}>
                          <Link
                            to={`/recommendations/${rec.id}`}
                            className={styles.favoriteImageLink}
                          >
                            <img
                              src={imageSrc}
                              alt={rec.title}
                              className={styles.favoriteImage}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                          </Link>

                          <div className={styles.favoriteInfo}>
                            <div>
                              <Link
                                to={`/recommendations/${rec.id}`}
                                className={styles.favoriteTitleLink}
                              >
                                <h4>{rec.title}</h4>
                              </Link>
                            </div>

                            {rec.departureDate && (
                              <p>
                                Ida:{" "}
                                {new Date(rec.departureDate).toLocaleDateString(
                                  "es-AR",
                                )}
                              </p>
                            )}

                            <strong>
                              {rec.price != null
                                ? `AR$ ${Number(rec.price).toLocaleString(
                                    "es-AR",
                                  )}`
                                : "Precio no disponible"}
                            </strong>

                            <button
                              type="button"
                              className={styles.removeFavoriteButton}
                              onClick={() => handleRemoveFavorite(rec.id)}
                            >
                              Quitar de favoritos
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </section>

      {checkoutOpen &&
        checkoutReservation &&
        checkoutForm &&
        (() => {
          const checkoutRecommendation =
            findRecommendationForReservation(checkoutReservation);

          const checkoutImageName =
            checkoutRecommendation?.mainImage ||
            checkoutRecommendation?.imageUrl ||
            null;

          const checkoutImage = checkoutImageName
            ? `http://localhost:8080/uploads/recommendations/${checkoutImageName}`
            : null;

          const hasReturnFlight = Boolean(checkoutReservation.returnDate);
          const departureFlight = checkoutReservation.selectedDepartureFlight;
          const returnFlight = checkoutReservation.selectedReturnFlight;

          const departurePrice = getFlightPriceByClass(
            departureFlight,
            checkoutReservation.flightClass,
          );

          const returnPrice = getFlightPriceByClass(
            returnFlight,
            checkoutReservation.flightClass,
          );

          const checkoutTotal =
            (departurePrice + (hasReturnFlight ? returnPrice : 0)) *
            (Number(checkoutReservation.passengers) || 1);

          return (
            <div className={styles.checkoutModalOverlay}>
              <div
                className={styles.checkoutModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-title"
              >
                <div className={styles.checkoutModalHeader}>
                  <div>
                    <span>Completar reserva</span>
                    <h3 id="checkout-title">Datos del viaje y pago</h3>
                    <p>
                      Completá la información necesaria. La reserva se
                      confirmará al aprobarse el pago simulado.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.checkoutCloseButton}
                    onClick={closeCheckout}
                    aria-label="Cerrar formulario de reserva"
                    disabled={processingPayment}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.checkoutTripCard}>
                  {checkoutImage ? (
                    <img
                      src={checkoutImage}
                      alt={
                        checkoutRecommendation?.title ||
                        checkoutReservation.destination
                      }
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.checkoutImagePlaceholder}>✈️</div>
                  )}

                  <div>
                    <span>Detalle de tu viaje</span>

                    <h4>
                      {checkoutReservation.origin} →{" "}
                      {checkoutReservation.destination}
                    </h4>

                    <p>
                      Ida: {formatDate(checkoutReservation.departureDate)} ·{" "}
                      {getFlightName(departureFlight)} ·{" "}
                      {getFlightSchedule(departureFlight)}
                    </p>

                    {hasReturnFlight && (
                      <p>
                        Vuelta: {formatDate(checkoutReservation.returnDate)} ·{" "}
                        {getFlightName(returnFlight)} ·{" "}
                        {getFlightSchedule(returnFlight)}
                      </p>
                    )}

                    <strong>
                      Total estimado: {formatPrice(checkoutTotal)}
                    </strong>
                  </div>
                </div>

                <form
                  className={styles.checkoutForm}
                  onSubmit={handleConfirmPayment}
                >
                  <section className={styles.checkoutSection}>
                    <div className={styles.checkoutSectionTitle}>
                      <span>01</span>

                      <div>
                        <h4>Datos de contacto</h4>
                        <p>
                          Ingresá los datos de la persona responsable de la
                          reserva.
                        </p>
                      </div>
                    </div>

                    <div className={styles.checkoutFormGrid}>
                      <label>
                        Nombre
                        <input
                          type="text"
                          value={checkoutForm.contactFirstName}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "contactFirstName",
                              event.target.value,
                            )
                          }
                          placeholder="Nombre de contacto"
                        />
                      </label>

                      <label>
                        Apellido
                        <input
                          type="text"
                          value={checkoutForm.contactLastName}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "contactLastName",
                              event.target.value,
                            )
                          }
                          placeholder="Apellido de contacto"
                        />
                      </label>

                      <label className={styles.checkoutFullWidth}>
                        Correo electrónico
                        <input
                          type="email"
                          value={checkoutForm.contactEmail}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "contactEmail",
                              event.target.value,
                            )
                          }
                          placeholder="correo@ejemplo.com"
                        />
                      </label>

                      <label>
                        Teléfono
                        <input
                          type="tel"
                          value={checkoutForm.contactPhone}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "contactPhone",
                              event.target.value,
                            )
                          }
                          placeholder="Ej. 11 1234 5678"
                        />
                      </label>

                      <label>
                        Documento
                        <input
                          type="text"
                          value={checkoutForm.contactDocument}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "contactDocument",
                              event.target.value,
                            )
                          }
                          placeholder="DNI o pasaporte"
                        />
                      </label>
                    </div>
                  </section>

                  <section className={styles.checkoutSection}>
                    <div className={styles.checkoutSectionTitle}>
                      <span>02</span>

                      <div>
                        <h4>Datos de pasajeros</h4>
                        <p>
                          Ingresá los datos exactamente como figuran en la
                          documentación.
                        </p>
                      </div>
                    </div>

                    <div className={styles.checkoutPassengersList}>
                      {checkoutForm.passengers.map((passenger, index) => (
                        <div
                          key={index}
                          className={styles.checkoutPassengerCard}
                        >
                          <strong>Pasajero {index + 1}</strong>

                          <div className={styles.checkoutFormGrid}>
                            <label>
                              Nombre
                              <input
                                type="text"
                                value={passenger.firstName}
                                onChange={(event) =>
                                  handleCheckoutPassengerChange(
                                    index,
                                    "firstName",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>

                            <label>
                              Apellido
                              <input
                                type="text"
                                value={passenger.lastName}
                                onChange={(event) =>
                                  handleCheckoutPassengerChange(
                                    index,
                                    "lastName",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>

                            <label>
                              Documento
                              <input
                                type="text"
                                value={passenger.documentNumber}
                                onChange={(event) =>
                                  handleCheckoutPassengerChange(
                                    index,
                                    "documentNumber",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>

                            <label>
                              Email <small>(opcional)</small>
                              <input
                                type="email"
                                value={passenger.email}
                                onChange={(event) =>
                                  handleCheckoutPassengerChange(
                                    index,
                                    "email",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={styles.checkoutSection}>
                    <div className={styles.checkoutSectionTitle}>
                      <span>03</span>

                      <div>
                        <h4>Selección de asientos</h4>
                        <p>
                          Elegí un asiento disponible para cada pasajero y para
                          cada tramo del viaje.
                        </p>
                      </div>
                    </div>

                    {loadingSeats ? (
                      <p className={styles.emptyText}>
                        Cargando asientos disponibles...
                      </p>
                    ) : (
                      <div className={styles.checkoutPassengersList}>
                        {checkoutForm.passengers.map((passenger, index) => (
                          <div
                            key={index}
                            className={styles.checkoutPassengerCard}
                          >
                            <strong>
                              Pasajero {index + 1}
                              {passenger.firstName || passenger.lastName
                                ? ` · ${passenger.firstName} ${passenger.lastName}`.trim()
                                : ""}
                            </strong>

                            <div className={styles.checkoutFormGrid}>
                              <label>
                                Asiento de ida
                                <select
                                  value={passenger.departureSeat}
                                  onChange={(event) =>
                                    handleCheckoutPassengerChange(
                                      index,
                                      "departureSeat",
                                      event.target.value,
                                    )
                                  }
                                  disabled={
                                    seatAvailability.departure.length === 0
                                  }
                                >
                                  <option value="">Seleccionar asiento</option>

                                  {seatAvailability.departure
                                    .filter(
                                      (seat) =>
                                        !checkoutForm.passengers.some(
                                          (otherPassenger, otherIndex) =>
                                            otherIndex !== index &&
                                            otherPassenger.departureSeat ===
                                              seat,
                                        ),
                                    )
                                    .map((seat) => (
                                      <option
                                        key={`departure-${seat}`}
                                        value={seat}
                                      >
                                        {seat}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              {hasReturnFlight && (
                                <label>
                                  Asiento de vuelta
                                  <select
                                    value={passenger.returnSeat}
                                    onChange={(event) =>
                                      handleCheckoutPassengerChange(
                                        index,
                                        "returnSeat",
                                        event.target.value,
                                      )
                                    }
                                    disabled={
                                      seatAvailability.return.length === 0
                                    }
                                  >
                                    <option value="">
                                      Seleccionar asiento
                                    </option>

                                    {seatAvailability.return
                                      .filter(
                                        (seat) =>
                                          !checkoutForm.passengers.some(
                                            (otherPassenger, otherIndex) =>
                                              otherIndex !== index &&
                                              otherPassenger.returnSeat ===
                                                seat,
                                          ),
                                      )
                                      .map((seat) => (
                                        <option
                                          key={`return-${seat}`}
                                          value={seat}
                                        >
                                          {seat}
                                        </option>
                                      ))}
                                  </select>
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className={styles.checkoutSection}>
                    <div className={styles.checkoutSectionTitle}>
                      <span>04</span>

                      <div>
                        <h4>Pago seguro</h4>
                        <p>
                          Simulación académica: no se almacena el número
                          completo ni el código de seguridad.
                        </p>
                      </div>
                    </div>

                    <div className={styles.checkoutPaymentMethods}>
                      <button
                        type="button"
                        className={
                          checkoutForm.paymentMethod === "credit"
                            ? styles.checkoutPaymentMethodActive
                            : styles.checkoutPaymentMethod
                        }
                        onClick={() =>
                          handleCheckoutFieldChange("paymentMethod", "credit")
                        }
                      >
                        Tarjeta de crédito
                      </button>

                      <button
                        type="button"
                        className={
                          checkoutForm.paymentMethod === "debit"
                            ? styles.checkoutPaymentMethodActive
                            : styles.checkoutPaymentMethod
                        }
                        onClick={() =>
                          handleCheckoutFieldChange("paymentMethod", "debit")
                        }
                      >
                        Tarjeta de débito
                      </button>
                    </div>

                    <div className={styles.checkoutFormGrid}>
                      <label className={styles.checkoutFullWidth}>
                        Titular de la tarjeta
                        <input
                          type="text"
                          value={checkoutForm.cardHolder}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "cardHolder",
                              event.target.value,
                            )
                          }
                          placeholder="Como figura en la tarjeta"
                        />
                      </label>

                      <label className={styles.checkoutFullWidth}>
                        Documento de la persona titular de la tarjeta
                        <input
                          type="text"
                          value={checkoutForm.cardDocument}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "cardDocument",
                              event.target.value,
                            )
                          }
                          placeholder="DNI o pasaporte"
                        />
                      </label>

                      <label className={styles.checkoutFullWidth}>
                        Número de tarjeta
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength="19"
                          value={checkoutForm.cardNumber}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "cardNumber",
                              formatCardNumber(event.target.value),
                            )
                          }
                          placeholder="0000 0000 0000 0000"
                        />
                      </label>

                      <label>
                        Vencimiento
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength="5"
                          value={checkoutForm.expiration}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "expiration",
                              formatExpiration(event.target.value),
                            )
                          }
                          placeholder="MM/AA"
                        />
                      </label>

                      <label>
                        Código de seguridad
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength="4"
                          value={checkoutForm.cvv}
                          onChange={(event) =>
                            handleCheckoutFieldChange(
                              "cvv",
                              event.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="CVV"
                        />
                      </label>
                    </div>
                  </section>

                  <label className={styles.checkoutTerms}>
                    <input
                      type="checkbox"
                      checked={checkoutForm.acceptedTerms}
                      onChange={(event) =>
                        handleCheckoutFieldChange(
                          "acceptedTerms",
                          event.target.checked,
                        )
                      }
                    />

                    <span>
                      Acepto los términos de compra y las políticas del viaje.
                    </span>
                  </label>

                  {checkoutError && (
                    <p className={styles.checkoutError} role="alert">
                      {checkoutError}
                    </p>
                  )}

                  <div className={styles.checkoutActions}>
                    <button
                      type="button"
                      className={styles.checkoutCancelButton}
                      onClick={closeCheckout}
                      disabled={processingPayment}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className={styles.checkoutConfirmButton}
                      disabled={processingPayment}
                      onClick={handleConfirmPayment}
                    >
                      {processingPayment
                        ? "Procesando pago..."
                        : "Confirmar pago y reserva"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {reviewModalOpen && selectedReservation && (
        <div className={styles.reviewModalOverlay}>
          <div className={styles.reviewModal}>
            <div className={styles.reviewModalHeader}>
              <div>
                <span>Valoración del viaje</span>
                <h3>¿Cómo fue tu experiencia?</h3>
              </div>

              <button
                type="button"
                className={styles.reviewCloseButton}
                onClick={closeReviewModal}
                aria-label="Cerrar valoración"
              >
                ✕
              </button>
            </div>

            <div className={styles.reviewTripSummary}>
              <strong>
                {selectedReservation.origin} → {selectedReservation.destination}
              </strong>

              <p>
                Ida: {formatDate(selectedReservation.departureDate)}
                {selectedReservation.returnDate &&
                  ` · Vuelta: ${formatDate(selectedReservation.returnDate)}`}
              </p>
            </div>

            <div className={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={
                    star <= selectedRating
                      ? styles.reviewStarActive
                      : styles.reviewStarButton
                  }
                  onClick={() => setSelectedRating(star)}
                  aria-label={`Puntuar con ${star} estrella${
                    star > 1 ? "s" : ""
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className={styles.reviewTextarea}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows="4"
              placeholder="Contanos cómo fue tu experiencia con este vuelo..."
            />

            {reviewMessage && (
              <p className={styles.reviewModalMessage}>{reviewMessage}</p>
            )}

            <div className={styles.reviewModalActions}>
              <button
                type="button"
                className={styles.reviewCancelButton}
                onClick={closeReviewModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.reviewSubmitButton}
                onClick={handleSubmitReview}
                disabled={savingReview}
              >
                {savingReview ? "Publicando..." : "Publicar valoración"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
