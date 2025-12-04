import React, { useEffect, useState } from 'react';

interface Recommendation {
    id: number;
    title: string;
    description: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    price: number;
    imageUrl: string;
}

const Recommendations: React.FC = () => {
    const [recommendations, setRecommendations] = useState < Recommendation[] > ([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/recommendations/random')
            .then(response => response.json())
            .then(data => setRecommendations(data))
            .catch(error => console.error(error));
    }, []);

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
            {recommendations.map(rec => (
                <div key={rec.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <img
                        src={`http://localhost:8080/uploads/${rec.imageUrl}`}
                        alt={rec.title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-1">{rec.title}</h2>
                        <p className="text-sm text-gray-500 mb-2">{rec.description}</p>
                        <p className="text-sm font-medium">🛫 {rec.origin} → {rec.destination}</p>
                        <p className="text-sm text-gray-600">🗓️ {rec.departureDate} - {rec.returnDate}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">${rec.price}</p>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default Recommendations;
