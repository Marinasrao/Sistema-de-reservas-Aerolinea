import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({});


  const validate = () => {
    const newErrors = {};

    const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-zA-Záéíóúñ]{1,}$/;

    if (!nameRegex.test(userData.firstName)) {
      newErrors.firstName =
        "Debe comenzar con mayúscula y tener al menos 2 letras";
    }

    if (!nameRegex.test(userData.lastName)) {
      newErrors.lastName =
        "Debe comenzar con mayúscula y tener al menos 2 letras";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Ingresá un correo electrónico válido";
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(userData.password)) {
      newErrors.password = "Mínimo 6 caracteres, una mayúscula y un número";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData({ ...userData, [name]: value });

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error en el registro");
      }

      const data = await res.json();
      setMessage(
        data.message || "Usuario registrado. Revisá tu email para activarlo."
      );

      setUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setErrors({});
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Crear cuenta</h2>
        <p className={styles.subtitle}>
          Registrate para acceder a todas las funcionalidades
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          <div className={styles.field}>
            <input
              type="text"
              name="firstName"
              placeholder="Nombre"
              value={userData.firstName}
              onChange={handleChange}
            />

            <span
              className={
                errors.firstName ? styles.error : styles.helper
              }
            >
              {errors.firstName || "Debe comenzar con mayúscula y tener al menos 2 letras"}
            </span>
          </div>


          <div className={styles.field}>
            <input
              type="text"
              name="lastName"
              placeholder="Apellido"
              value={userData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
            />
            <span
              className={errors.lastName ? styles.error : styles.helper}
            >
              {errors.lastName || "Debe comenzar con mayúscula y tener al menos 2 letras"}
            </span>

          </div>
          <div className={styles.field}>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={userData.email}
              onChange={handleChange}
            />

            {touched.email && !errors.email && (
              <span className={styles.helper}>
                Usá un correo electrónico válido
              </span>
            )}

            {errors.email && (
              <span className={styles.error}>
                {errors.email}
              </span>
            )}
          </div>



          <div className={styles.field}>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              autoComplete="new-password"
              value={userData.password}
              onChange={handleChange}
            />

            {touched.password && !errors.password && (
              <span className={styles.helper}>
                Mínimo 6 caracteres, una mayúscula y un número
              </span>
            )}

            {errors.password && (
              <span className={styles.error}>
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit">Crear cuenta</button>
        </form>

        {message && <p className={styles.message}>{message}</p>}

        <p className={styles.loginLink}>
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
