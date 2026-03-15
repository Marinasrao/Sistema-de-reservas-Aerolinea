const API_URL = "http://localhost:8080/api/admin/users";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

export const getAdmins = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders()
  });

  if (!res.ok) throw new Error("Error al obtener administradores");
  return res.json();
};

export const createAdmin = async (admin) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(admin)
  });

  if (!res.ok) throw new Error("Error al crear administrador");
  return res.json();
};

export const updateAdmin = async (id, admin) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(admin)
  });

  if (!res.ok) throw new Error("Error al actualizar administrador");
  return res.json();
};

export const deleteAdmin = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!res.ok) throw new Error("Error al eliminar administrador");
};