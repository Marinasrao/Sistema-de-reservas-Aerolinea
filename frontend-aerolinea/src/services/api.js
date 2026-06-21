
const API_BASE_URL = '/api';




const makeRequest = async (endpoint, method, body = null, isFormData = false) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token') || '';

    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        credentials: 'include',
        body: isFormData ? body : (body ? JSON.stringify(body) : null)
    };


    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `HTTP ${response.status}`;

            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
            } else {
                const text = await response.text();
                errorMessage += ` - ${text}`;
            }

            console.error('❌ Respuesta con error del backend:', errorMessage);
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return {};
        }

    } catch (error) {
        console.error('⚠️ Error en la petición:', error.message || error);
        if (error.message.includes('401')) {
            window.location.href = '/login';
        }
        throw error;
    }
};



//============ VUELOS =====================

export const getAllFlights = async (page = 0, size = 5) => {
  const res = await fetch(
    `http://localhost:8080/api/flights?page=${page}&size=${size}`,
    { credentials: 'include' }
  );

  if (!res.ok) throw new Error('Error al obtener vuelos');
  return res.json();
};


export const getRandomFlights = async () => {
    return makeRequest('/flights/random', 'GET');
};

export const getFlightById = async (id) => {
    return makeRequest(`/flights/${id}`, 'GET');
};

export const createFlight = async (payload) => {
    const res = await fetch("http://localhost:8080/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Error al crear el vuelo");
    }

    return res.json();
};


export const updateFlight = async (id, flightData) => {
    const isFormData = flightData instanceof FormData;
    return makeRequest(`/flights/${id}`, 'PUT', flightData, isFormData);
};

export const deleteFlight = async (id) => {
    return makeRequest(`/flights/${id}`, 'DELETE');
};

export const searchFlights = async (params) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/flights/search?${query}`, 'GET');
};
export const getDestinationsByOrigin = async (origin) => {
const res = await fetch(
`http://localhost:8080/api/flights/destinations-by-origin?origin=${encodeURIComponent(origin)}`,
{ credentials: "include" }
);

if (!res.ok) throw new Error("Error al obtener destinos por origen");

return res.json();
};



// ===================== RECOMENDACIONES =====================

export const getAllRecommendations = async () => {
    return makeRequest('/recommendations', 'GET');
};

export const getRecommendationById = async (id) => {
    return makeRequest(`/recommendations/${id}`, 'GET');
};

export const saveRecommendationDetails = async (id, formData) => {
    return makeRequest(`/recommendations/${id}/details`, 'POST', formData, true);
};

export const deleteRecommendationDetails = async (id) => {
    const response = await fetch(`${API_BASE_URL}/recommendations/${id}/details`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Error al eliminar detalles de recomendación');
    }

    return await response.json();
};

export const saveRecommendation = async (formData, id = null) => {
    if (id) {
        return makeRequest(`/recommendations/edit/${id}`, 'PUT', formData, true);
    }
    return makeRequest('/recommendations/add', 'POST', formData, true);
};



export const deleteRecommendation = async (id) => {
    const response = await fetch(`${API_BASE_URL}/recommendations/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Error al eliminar recomendación');
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return {};
    }
};



// ===================== PASAJEROS =====================

export const getAllPassengers = async (page = 0, size = 15) => {
  return makeRequest(`/passengers?page=${page}&size=${size}`, 'GET');
};

export const createPassenger = async (passengerData) => {
    return makeRequest('/passengers', 'POST', passengerData);
};

export const deletePassenger = async (id) => {
    return makeRequest(`/passengers/${id}`, 'DELETE');
};
// ===================== ASIENTOS DISPONIBLES =====================

export const getAvailableSeats = async (flightId, flightClass) => {
  return makeRequest(
    `/passengers/available-seats?flightId=${encodeURIComponent(
      flightId
    )}&flightClass=${encodeURIComponent(flightClass)}`,
    "GET"
  );
};



// ===================== CATEGORÍAS =====================

// Público (Home, vuelos, filtros) 
export const getAllCategories = async () => {
    return makeRequest('/categories', 'GET');
};

// Admin (gestión)
export const saveCategory = async (formData, id = null) => {
    if (id) {
        return makeRequest(`/categories/admin/${id}`, 'PUT', formData, true);
    }
    return makeRequest('/categories/admin', 'POST', formData, true);
};

export const deleteCategory = async (id) => {
    return makeRequest(`/categories/admin/${id}`, 'DELETE');
};







