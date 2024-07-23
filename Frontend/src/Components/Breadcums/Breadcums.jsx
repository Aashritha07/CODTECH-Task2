import React from 'react';
import './Breadcums.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

const Breadcums = ({ product }) => {
  if (!product) {
    return <div>Loading...</div>; // or return null; if you prefer to render nothing
  }

  return (
    <div className='breadcum'>
      HOME <img src={arrow_icon} alt="" /> SHOP
      <img src={arrow_icon} alt="" /> {product.category} <img src={arrow_icon} alt="" /> {product.name}
    </div>
  );
};

export default Breadcums;
