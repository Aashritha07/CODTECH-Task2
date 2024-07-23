import React, { createContext, useEffect, useState } from "react";
import all_product from '../Components/Assets/all_product';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index <= 37; index++) { // Assuming you have product IDs from 0 to 37
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        const fetchCart = async () => {
            if (localStorage.getItem('auth-token')) {
                try {
                    const response = await fetch('http://localhost:4000/getcart', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'auth-token': `${localStorage.getItem('auth-token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: null,
                    });
                    if (!response.ok) throw new Error('Failed to fetch cart items');
                    const data = await response.json();
                    // Ensure data is in the expected format (object with item IDs as keys and quantities as values)
                    if (typeof data === 'object' && data !== null) {
                        setCartItems(data);
                    } else {
                        console.error('Unexpected cart data format:', data);
                    }
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                }
            }
        };

        fetchCart();
    }, []);

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

        if (localStorage.getItem('auth-token')) {
            try {
                const response = await fetch('http://localhost:4000/addtocart', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'auth-token': `${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "itemId": itemId })
                });
                if (!response.ok) throw new Error('Failed to add item to cart');
                const data = await response.json();
                console.log('Server Response:', data);
            } catch (error) {
                console.error('Error:', error);
                if (error.message === 'Failed to add item to cart') {
                    alert('Please log in to add items to the cart.');
                }
            }
        } else {
            alert('Please log in to add items to the cart.');
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            if (prev[itemId] > 0) {
                return { ...prev, [itemId]: prev[itemId] - 1 };
            }
            return prev;
        });

        if (localStorage.getItem('auth-token')) {
            try {
                const response = await fetch('http://localhost:4000/removefromcart', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'auth-token': `${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "itemId": itemId })
                });
                if (!response.ok) throw new Error('Failed to remove item from cart');
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount; 
    };

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + (quantity > 0 ? quantity : 0), 0);
    };

    const contextValue = { getTotalCartAmount, getTotalCartItems, all_product, cartItems, addToCart, removeFromCart };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
