const API_BASE_URL = '/api';

const makeRequest = async (endpoint, method, body = null, isFormData = false) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem ('token') || '';

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

export const getAllFlights = async () => {
    return makeRequest('/flights', 'GET');
};

export const getRandomFlights = async () => {
    return makeRequest('/flights/random', 'GET');
};

export const getFlightById = async (id) => {
    return makeRequest(`/flights/${id}`, 'GET');
};

export const createFlight = async (flightData) => {
    const isFormData = flightData instanceof FormData;
    return makeRequest('/flights', 'POST', flightData, isFormData);
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

export const getAllPassengers = async () => {
    return makeRequest('/passengers', 'GET');
};

export const createPassenger = async (passengerData) => {
    return makeRequest('/passengers', 'POST', passengerData);
};

export const deletePassenger = async (id) => {
    return makeRequest(`/passengers/${id}`, 'DELETE');
};
// ===================== ASIENTOS DISPONIBLES =====================

export const getAvailableSeats = async (flightId, flightClass) => {
  return makeRequest(`/flights/${flightId}/available-seats?flightClass=${flightClass}`, 'GET');
};

// ===================== CATEGORÍAS =====================

export const getAllCategories = async () => {
  return makeRequest('/categories', 'GET');
};

export const saveCategory = async (formData, id = null) => {
  if (id) {
    return makeRequest(`/categories/${id}`, 'PUT', formData, true);
  }
  return makeRequest('/categories', 'POST', formData, true);
};

export const deleteCategory = async (id) => {
  return makeRequest(`/categories/${id}`, 'DELETE');
};







