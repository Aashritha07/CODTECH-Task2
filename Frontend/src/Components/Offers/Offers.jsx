import React from 'react';
import './Offers.css';
import exclusice_image from '../Assets/exclusive_image.png'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
            <h1>Exclusive</h1>
            <h1>Offers For You</h1>
            <p>ONLY FOR BEST SELLERS PRODUCTS</p>
            <button>Check Now</button>
      </div>
      <div className="offers-right">
        <img src={exclusice_image} alt="" />
      </div>
    </div>
  )
}

export default Offers
