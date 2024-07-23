import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="success-container">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase.</p>
      <button onClick={handleContinueShopping} className="continue-shopping-button">
        Continue Shopping
      </button>
    </div>
  );
};

export default Success;
