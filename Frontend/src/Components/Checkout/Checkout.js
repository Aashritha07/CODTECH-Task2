// // Checkout.jsx
// import React, { useContext, useState } from 'react';
// import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
// import { ShopContext } from './ShopContextProvider';

// const Checkout = () => {
//   const { getTotalCartAmount, cartItems } = useContext(ShopContext);
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setIsProcessing(true);

//     const { error, paymentMethod } = await stripe.createPaymentMethod({
//       type: 'card',
//       card: elements.getElement(CardElement),
//     });

//     if (error) {
//       setError(error.message);
//       setIsProcessing(false);
//       return;
//     }

//     // Proceed with your server-side integration to complete the payment
//     const response = await fetch('http://localhost:4000/payment', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         paymentMethodId: paymentMethod.id,
//         amount: getTotalCartAmount(),
//       }),
//     });

//     const data = await response.json();

//     if (data.error) {
//       setError(data.error);
//     } else {
//       // Handle successful payment
//       alert('Payment successful!');
//     }

//     setIsProcessing(false);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Total Amount: ${getTotalCartAmount()}</h2>
//       <CardElement />
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//       <button type="submit" disabled={isProcessing}>
//         {isProcessing ? 'Processing...' : 'Pay Now'}
//       </button>
//     </form>
//   );
// };

// export default Checkout;
