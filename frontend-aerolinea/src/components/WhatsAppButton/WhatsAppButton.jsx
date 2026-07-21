import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "./WhatsAppButton.module.css";

const API_BASE = "http://localhost:8080/api";

const WHATSAPP_PHONE = String(
  import.meta.env.VITE_WHATSAPP_PHONE || "",
).replace(/\D/g, "");

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

const SUCCESS_MESSAGE =
  "¡Tu mensaje fue recibido con éxito! En instantes nos estaremos comunicando con vos.";

const WhatsAppButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const feedbackTimeoutRef = useRef(null);
  const firstInputRef = useRef(null);

  const whatsappMessage = useMemo(() => {
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    const messageParts = [
      "Hola FlightBooking.",
      name ? `Mi nombre es ${name}.` : "",
      phone ? `Mi teléfono es ${phone}.` : "",
      email ? `Mi email es ${email}.` : "",
      message ? `Consulta: ${message}` : "",
    ].filter(Boolean);

    return messageParts.join("\n");
  }, [formData]);

  const whatsappUrl = useMemo(() => {
    const encodedMessage = encodeURIComponent(whatsappMessage);

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
  }, [whatsappMessage]);

  const showFeedback = useCallback((message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);

    window.clearTimeout(feedbackTimeoutRef.current);

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback("");
    }, 5000);
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setFieldErrors({});

    if (!messageSent) {
      setFeedback("");
    }
  }, [isSubmitting, messageSent]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimeout = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      window.clearTimeout(focusTimeout);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    return () => {
      window.clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFieldErrors({});
    setFeedback("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.replace(/\D/g, "");
    const cleanEmail = formData.email.trim();
    const cleanMessage = formData.message.trim();

    if (!cleanName) {
      errors.name = "Ingresá tu nombre.";
    } else if (cleanName.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!cleanPhone) {
      errors.phone = "Ingresá un número de teléfono.";
    } else if (!/^\d{8,15}$/.test(cleanPhone)) {
      errors.phone = "Ingresá un número de teléfono válido.";
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      errors.email = "Ingresá un correo electrónico válido.";
    }

    if (!cleanMessage) {
      errors.message = "Escribí tu consulta.";
    } else if (cleanMessage.length < 10) {
      errors.message = "La consulta debe tener al menos 10 caracteres.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback("");

    if (!validateForm()) {
      showFeedback(
        "Revisá los datos señalados antes de enviar la consulta.",
        "error",
      );
      return;
    }

    if (!navigator.onLine) {
      showFeedback(
        "No hay conexión a internet. Revisá tu conexión e intentá nuevamente.",
        "error",
      );
      return;
    }

    const requestBody = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      message: formData.message.trim(),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/contact-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let backendMessage = "";

        try {
          const errorData = await response.json();

          backendMessage =
            errorData?.message ||
            errorData?.error ||
            errorData?.details ||
            "";
        } catch {
          backendMessage = "";
        }

        throw new Error(
          backendMessage ||
            "No pudimos registrar tu mensaje. Intentá nuevamente.",
        );
      }

      setMessageSent(true);
      setFieldErrors({});
      showFeedback(SUCCESS_MESSAGE, "success");
    } catch (error) {
      console.error("Error al enviar la consulta:", error);

      showFeedback(
        error.message ||
          "No pudimos registrar tu mensaje. Intentá nuevamente.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToWhatsApp = (event) => {
    if (!WHATSAPP_PHONE) {
      event.preventDefault();

      showFeedback(
        "La consulta fue recibida, pero el número de WhatsApp no está configurado.",
        "error",
      );
      return;
    }

    if (!/^\d{10,15}$/.test(WHATSAPP_PHONE)) {
      event.preventDefault();

      showFeedback(
        "La consulta fue recibida, pero el número de WhatsApp no tiene un formato válido.",
        "error",
      );
      return;
    }

    if (!navigator.onLine) {
      event.preventDefault();

      showFeedback(
        "No hay conexión a internet. Tu consulta ya fue registrada, pero no podemos abrir WhatsApp.",
        "error",
      );
    }
  };

  const handleNewMessage = () => {
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setFeedback("");
    setMessageSent(false);

    window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <div className={styles.whatsappWrapper}>
        {feedback && !isModalOpen && (
          <div
            className={`${styles.whatsappFeedback} ${
              feedbackType === "error"
                ? styles.whatsappFeedbackError
                : ""
            }`}
            role="status"
            aria-live="polite"
          >
            {feedback}
          </div>
        )}

        <button
          type="button"
          className={styles.whatsappButton}
          onClick={handleOpenModal}
          aria-label="Abrir formulario de contacto"
          title="Consultanos por WhatsApp"
        >
          <span className={styles.whatsappIcon} aria-hidden="true">
            <FaWhatsapp />
          </span>

          <span className={styles.whatsappText}>Contáctanos</span>
        </button>
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleBackdropClick}
          role="presentation"
        >
          <section
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-contact-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label="Cerrar formulario de contacto"
            >
              ×
            </button>

            {!messageSent ? (
              <>
                <header className={styles.modalHeader}>
                  <div className={styles.modalIcon} aria-hidden="true">
                    <FaWhatsapp />
                  </div>

                  <div>
                    <p className={styles.modalEyebrow}>
                      Atención personalizada
                    </p>

                    <h2
                      id="whatsapp-contact-title"
                      className={styles.modalTitle}
                    >
                      Enviá tu consulta
                    </h2>

                    <p className={styles.modalDescription}>
                      Completá el formulario y confirmaremos que tu mensaje fue
                      recibido correctamente.
                    </p>
                  </div>
                </header>

                <form
                  className={styles.contactForm}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="contact-name">
                        Nombre y apellido
                        <span aria-hidden="true"> *</span>
                      </label>

                      <input
                        ref={firstInputRef}
                        id="contact-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej.: Marina Rao"
                        autoComplete="name"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={
                          fieldErrors.name
                            ? "contact-name-error"
                            : undefined
                        }
                      />

                      {fieldErrors.name && (
                        <span
                          id="contact-name-error"
                          className={styles.fieldError}
                        >
                          {fieldErrors.name}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="contact-phone">
                        Teléfono
                        <span aria-hidden="true"> *</span>
                      </label>

                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ej.: 11 1234 5678"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={
                          fieldErrors.phone
                            ? "contact-phone-error"
                            : undefined
                        }
                      />

                      {fieldErrors.phone && (
                        <span
                          id="contact-phone-error"
                          className={styles.fieldError}
                        >
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contact-email">
                      Correo electrónico
                      <span className={styles.optionalText}> (opcional)</span>
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ej.: marina@email.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email
                          ? "contact-email-error"
                          : undefined
                      }
                    />

                    {fieldErrors.email && (
                      <span
                        id="contact-email-error"
                        className={styles.fieldError}
                      >
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contact-message">
                      Consulta
                      <span aria-hidden="true"> *</span>
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Contanos cómo podemos ayudarte con tu reserva o destino."
                      rows={5}
                      maxLength={1000}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={
                        fieldErrors.message
                          ? "contact-message-error"
                          : "contact-message-help"
                      }
                    />

                    <div className={styles.textareaInformation}>
                      <span
                        id="contact-message-help"
                        className={styles.characterHelp}
                      >
                        Máximo 1000 caracteres
                      </span>

                      <span className={styles.characterCount}>
                        {formData.message.length}/1000
                      </span>
                    </div>

                    {fieldErrors.message && (
                      <span
                        id="contact-message-error"
                        className={styles.fieldError}
                      >
                        {fieldErrors.message}
                      </span>
                    )}
                  </div>

                  {feedback && (
                    <div
                      className={`${styles.modalFeedback} ${
                        feedbackType === "error"
                          ? styles.modalFeedbackError
                          : styles.modalFeedbackSuccess
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      {feedback}
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeModal}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Enviando consulta..."
                        : "Enviar consulta"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.successContent}>
                <div className={styles.successIcon} aria-hidden="true">
                  ✓
                </div>

                <p className={styles.successEyebrow}>
                  Consulta registrada
                </p>

                <h2
                  id="whatsapp-contact-title"
                  className={styles.successTitle}
                >
                  ¡Mensaje recibido!
                </h2>

                <p className={styles.successMessage}>{SUCCESS_MESSAGE}</p>

                <div
                  className={styles.successSummary}
                  aria-label="Resumen de la consulta"
                >
                  <div className={styles.summaryItem}>
                    <span>Nombre</span>
                    <strong>{formData.name}</strong>
                  </div>

                  <div className={styles.summaryItem}>
                    <span>Teléfono</span>
                    <strong>{formData.phone}</strong>
                  </div>

                  {formData.email && (
                    <div className={styles.summaryItem}>
                      <span>Email</span>
                      <strong>{formData.email}</strong>
                    </div>
                  )}

                  <div className={styles.summaryMessage}>
                    <span>Consulta</span>
                    <p>{formData.message}</p>
                  </div>
                </div>

                {feedback && feedbackType === "error" && (
                  <div
                    className={`${styles.modalFeedback} ${styles.modalFeedbackError}`}
                    role="alert"
                  >
                    {feedback}
                  </div>
                )}

                <div className={styles.successActions}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.continueButton}
                    onClick={handleContinueToWhatsApp}
                  >
                    <FaWhatsapp aria-hidden="true" />
                    Continuar por WhatsApp
                  </a>

                  <button
                    type="button"
                    className={styles.newMessageButton}
                    onClick={handleNewMessage}
                  >
                    Enviar otra consulta
                  </button>

                  <button
                    type="button"
                    className={styles.finishButton}
                    onClick={closeModal}
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;