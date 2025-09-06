import React, { useEffect, useState } from 'react'
import './Homepage.css'
import { images } from '../Asset/image'


function Homepage() {
   const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className={screenSize > 480 ? 'home':'hidepage'}>
        <div className='logo'>
          <img src={images.logo} alt="" />
        </div>
        <div className='content'>
          <p>Send And Receieve messages without keeping your phone online</p>
          <p>End To End Encyption</p>
        </div>
    </div>
  )
}

export default Homepage
