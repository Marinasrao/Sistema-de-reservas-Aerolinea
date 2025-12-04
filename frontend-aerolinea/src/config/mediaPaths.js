// Ruta base de imágenes de recomendaciones
const BASE_RECO_URL = 'http://localhost:8080/uploads/recommendations/';


export const recoUrl = (fileName) => {
    return fileName ? `${BASE_RECO_URL}${fileName}` : '';
};
