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

    if (
      userData.password &&
      !/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(userData.password)
    ) {
      newErrors.password = "Mínimo 6 caracteres, una mayúscula y un número";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleChange = (e) => {
  const { name, value } = e.target;

  setUserData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setTouched((prev) => ({
    ...prev,
    [name]: true,
  }));

  
  if (value === "") {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }
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

            {touched.firstName && errors.firstName && (
              <span className={styles.error}>{errors.firstName}</span>
            )}
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

            {touched.lastName && errors.lastName && (
              <span className={styles.error}>{errors.lastName}</span>
            )}
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

            {touched.email && errors.email && (
              <span className={styles.error}>{errors.email}</span>
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

            {touched.password && errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          <div className={styles.registerHelp}>
            <p>📌 Requisitos para el registro:</p>
            <ul>
              <li>Nombre y Apellido: mínimo 2 letras y comenzar con mayúscula</li>
              <li>Correo electrónico válido</li>
              <li>Contraseña: al menos 6 caracteres, una mayúscula y un número</li>
            </ul>
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
