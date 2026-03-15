const BASE = "http://localhost:8080";

const authHeaders = () => {
const token = localStorage.getItem("token");

return {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
};
};

export const getAllCharacteristics = async () => {
const res = await fetch(`${BASE}/api/admin/characteristics`, {
headers: authHeaders(),
});

if (!res.ok) throw new Error("Error al obtener características");
return res.json();
};

export const createCharacteristic = async (payload) => {
const res = await fetch(`${BASE}/api/admin/characteristics`, {
method: "POST",
headers: authHeaders(),
body: JSON.stringify(payload),
});

if (!res.ok) throw new Error("Error al crear característica");
return res.json();
};

export const deleteCharacteristic = async (id) => {
const res = await fetch(`${BASE}/api/admin/characteristics/${id}`, {
method: "DELETE",
headers: authHeaders(),
});

if (!res.ok) throw new Error("Error al eliminar característica");
};

export const getCategories = async () => {
const res = await fetch(`${BASE}/api/categories`);

if (!res.ok) throw new Error("Error al obtener categorías");
return res.json();
};

export const getCategoryCharacteristics = async (categoryId) => {
const res = await fetch(
`${BASE}/api/admin/categories/${categoryId}/characteristics`,
{
headers: authHeaders(),
}
);

if (!res.ok)
throw new Error("Error al obtener características de la categoría");

return res.json();
};

export const updateCategoryCharacteristics = async (categoryId, ids) => {
const res = await fetch(
`${BASE}/api/admin/categories/${categoryId}/characteristics`,
{
method: "PUT",
headers: authHeaders(),
body: JSON.stringify(ids),
}
);

if (!res.ok)
throw new Error("Error al guardar características de la categoría");

return res.json();
};
