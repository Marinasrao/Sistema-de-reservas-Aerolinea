import { useEffect, useState } from 'react';

const HeroDebug = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/hero')
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#f8f8f8' }}>
            <h2>📦 Datos del Hero (debug)</h2>
            <pre style={{ background: '#eee', padding: '1rem', borderRadius: '8px' }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

export default HeroDebug;
