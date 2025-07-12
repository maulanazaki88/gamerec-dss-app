import s from "./BackgroundCarousel.module.css";
import React, { useState, useEffect } from 'react'

const images = [
    "/gow-ragnarok.jpg",
    "/ac-origins.jpg",
    "/re-4.jpg",
    "/tekken-8.jpg",
    "/mh-world.jpg",
]

const BackgroundCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500); // Half second black fade
      
    }, 8000); // 8 second interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={s.backgroundCarousel}>
      {/* Background Image */}
      <div 
        className={s.backgroundImage}
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      />
      
      {/* Black Overlay */}
      <div className={s.blackOverlay} />
      
      {/* Gradient Overlays */}
      <div className={s.gradientTop} />
      <div className={s.gradientBottom} />
      
      {/* Fade Transition Overlay */}
      {isTransitioning && <div className={s.fadeOverlay} />}
    </div>
  )
}

export default BackgroundCarousel
