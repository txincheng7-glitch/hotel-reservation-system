import { useRef, useEffect } from 'react'
import styles from './Welcome.module.css'
import { Carousel } from 'antd';
// Import the Carousel type for ref usage
import type { CarouselRef } from 'antd/es/carousel';
import Login from '../Login/Login'


export default function Welcome() {
  const carouselRef = useRef<CarouselRef>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        // Scroll down, go to next slide
        carouselRef.current?.next();
      } else {
        // Scroll up, go to previous slide
        carouselRef.current?.prev();
      }
    };

    // Add wheel event listener to the document
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
      <Carousel ref={carouselRef} arrows dotPlacement="start" infinite={false}>
        <div>
          <div className={`${styles.carouselItem} ${styles.welcomeItem}`}>
            <div className={styles.systemTitle} ></div>
          </div>
        </div>
        <div>
          <div className={`${styles.carouselItem} ${styles.loginItem}`} >
            <div className={styles.loginContainer}>
              <Login/>
            </div>
          </div>
        </div>
      </Carousel>
    </>
  )
}