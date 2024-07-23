import React, { useContext } from 'react';
import { ShopContext } from '../../Contexts/ShopContext';
import cart_cross from '../Assets/cart_cross_icon.png';
import './CartItems.css';  // Make sure to include this line to import your CSS

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCheckout = async () => {
    if (Object.keys(cartItems).length === 0) {
      console.error('Cart is empty');
      return;
    }

    if (!Array.isArray(all_product) || all_product.length === 0) {
      console.error('Product list is empty');
      return;
    }

    const products = Object.keys(cartItems).map((id) => {
      const product = all_product.find((product) => product.id === Number(id));
      if (!product || !product.new_price || cartItems[id] <= 0) {
        return null;
      }

      return {
        id,
        name: product.name,
        image: isValidURL(product.image) ? product.image : 'https://via.placeholder.com/150',
        price: product.new_price,
        quantity: cartItems[id],
      };
    }).filter(product => product !== null);

    if (products.length === 0) {
      console.error('No valid products found for checkout');
      return;
    }

    const body = {
      products,
    };

    try {
      const response = await fetch('http://localhost:4000/create-checkout-session', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('Failed to create checkout session:', response.statusText);
        return;
      }

      const session = await response.json();
      const stripe = window.Stripe('pk_test_51PeuQrJCaPSpl3fe6Abcr5Bhz0VTuI84ZADtMG5uWSraifgPkppXZaVJME5eapkiYPkrpcTgjw3qnxRd2EBfp2kY00aVIe2LUI');
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error('Error redirecting to checkout:', result.error.message);
      } else {
        console.log('Redirecting to checkout...');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      <div>
        {Object.keys(cartItems).map((id) => {
          const product = all_product.find((product) => product.id === Number(id));
          if (product && cartItems[id] > 0) {
            return (
              <div key={id}>
                <div className="cartitems-format">
                  <img src={product.image} className='carticon-product-icon' alt={product.name} />
                  <p>{product.name}</p>
                  <p>${product.new_price.toFixed(2)}</p>
                  <button className='cartitems-quantity'>{cartItems[id]}</button>
                  <p>${(product.new_price * cartItems[id]).toFixed(2)}</p>
                  <img src={cart_cross} className='remove_icon' alt="Remove" onClick={() => removeFromCart(id)} />
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
        <div className="cartitms-down">
          <div className="cartitems-total">
            <h1>Cart Totals</h1>
            <div>
              <div className="cartitems-total-item">
                <p>Subtotal</p>
                <p>${getTotalCartAmount().toFixed(2)}</p>
              </div>
              <hr />
              <div className="cartitems-total-item">
                <p>Shipping Fee</p>
                <p>Free</p>
              </div>
              <hr />
              <div className="cartitems-total-item">
                <h3>Total</h3>
                <h3>${getTotalCartAmount().toFixed(2)}</h3>
              </div>
            </div>
            <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
          </div>
          <div className="cartitems-promocode">
            <p>If you have a promo code, enter it here</p>
            <div className="cartitems-promobox">
              <input type="text" placeholder='Promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
