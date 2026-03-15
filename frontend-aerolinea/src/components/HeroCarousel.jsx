import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import './HeroCarousel.css';
import LoadingSpinner from './LoadingSpinner'; 

const HeroCarousel = () => {
  const [images, setImages] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    
    fetch('http://localhost:8080/api/hero')
      .then(res => res.json())
      .then(data => {
        

        if (!data.length) {
          console.warn('⚠️ No se recibieron imágenes');
          setIsReady(true);
          return;
        }

        let timeout = setTimeout(() => {
          console.warn('⚠️ Tiempo de espera superado, forzando render');
          setIsReady(true);
        }, 3000);

        const preloadPromises = data.map((img) => {
          return new Promise((resolve) => {
            const preloadImg = new Image();
            preloadImg.src = `http://localhost:8080/uploads/hero/${encodeURIComponent(img.filename)}`;
            preloadImg.onload = () => {
              
              resolve();
            };
            preloadImg.onerror = () => {
              console.warn(`❌ Falló precarga: ${preloadImg.src}`);
              resolve();
            };
          });
        });

        Promise.all(preloadPromises).then(() => {
          clearTimeout(timeout);
          setImages(data);
          setIsReady(true);
          
        });
      })
      .catch((err) => {
        console.error('❌ Error al precargar imágenes:', err);
        setIsReady(true);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    pauseOnHover: true,
    pauseOnDotsHover: true,
    fade: true,
  };

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return (
    <div className="carouselWrapper">
      <div className="carousel-container">
        <Slider {...settings}>
          {images.map((img) => (
            <div key={img.id} className="slide">
              <div
                className="slide-image"
                style={{
                  backgroundImage: `url(http://localhost:8080/uploads/hero/${encodeURIComponent(img.filename)})`
                }}
              />
              {img.description && (
                <div className="caption">{img.description}</div>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default HeroCarousel;
