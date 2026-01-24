const API_URL = "http://localhost:8080/api/admin/users";

export const getAdmins = async () => {
  const res = await fetch(API_URL, {
    credentials: "include"
  });

  if (!res.ok) throw new Error("Error al obtener administradores");
  return res.json();
};

export const createAdmin = async (admin) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(admin)
  });

  if (!res.ok) throw new Error("Error al crear administrador");
  return res.json();
};

export const updateAdmin = async (id, admin) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(admin)
  });

  if (!res.ok) throw new Error("Error al actualizar administrador");
  return res.json();
};

export const deleteAdmin = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) throw new Error("Error al eliminar administrador");
};
