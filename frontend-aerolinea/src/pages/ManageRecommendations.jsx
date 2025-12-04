import React, { useState } from 'react';
import AdminRecommendationsPage from './AdminRecommendationsPage';
import RecommendationDetailForm from './RecommendationDetailForm';

const ManageRecommendations = () => {
    const [tab, setTab] = useState('cards'); 
    const [selectedId, setSelectedId] = useState(null);

    const goToDetails = (id) => {
        setSelectedId(id);
        setTab('details');
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setTab('cards')} disabled={tab === 'cards'}>Cards</button>
                <button onClick={() => setTab('details')} disabled={tab === 'details'}>Detalles</button>
            </div>

            {tab === 'cards' && (
                <AdminRecommendationsPage onSelect={goToDetails} />
            )}

            {tab === 'details' && (
                selectedId
                    ? <RecommendationDetailForm selectedId={selectedId} />
                    : <p>Elegí una card desde la pestaña “Cards” para editar sus detalles.</p>
            )}
        </div>
    );
};

export default ManageRecommendations;
