import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteFlight } from '../services/api';

export default function DeleteFlightPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const deleteSelectedFlight = async () => {
            try {
                await deleteFlight(id); 
                alert('Vuelo eliminado correctamente');
                navigate('/admin/listar-vuelos'); 
            } catch (error) {
                alert('Error al eliminar vuelo');
                console.error(error);
                navigate('/admin/listar-vuelos'); 
            }
        };

        if (window.confirm('¿Estás seguro de eliminar este vuelo?')) {
            deleteSelectedFlight();
        } else {
            navigate('/admin/listar-vuelos'); 
        }
    }, [id, navigate]);

    return null;
}
