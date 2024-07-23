import React, { useContext, useState } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Contexts/ShopContext';

const Navbar = () => {
    const [activeMenu, setActiveMenu] = useState(null); // State to track active menu item
    const [showMenu, setShowMenu] = useState(false); // State for toggle menu
    const { getTotalCartItems } = useContext(ShopContext);

    const handleMenuClick = (menuName) => {
        setActiveMenu(menuName === activeMenu ? null : menuName);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    return (
        <div className='navbar'>
            <div className="nav-logo">
                <img src={logo} alt="logo" />
                <p>FASHION FACTORY</p>
            </div>
            <ul className={`nav-menu ${showMenu ? 'active' : ''}`}>
                <li onClick={() => handleMenuClick("shop")}>
                    <Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>
                    {activeMenu === "shop" ? <hr /> : null}
                </li>
                <li onClick={() => handleMenuClick("mens")}>
                    <Link style={{ textDecoration: 'none' }} to='/mens'>Men</Link>
                    {activeMenu === "mens" ? <hr /> : null}
                </li>
                <li onClick={() => handleMenuClick("womens")}>
                    <Link style={{ textDecoration: 'none' }} to='/womens'>Women</Link>
                    {activeMenu === "womens" ? <hr /> : null}
                </li>
                <li onClick={() => handleMenuClick("kids")}>
                    <Link style={{ textDecoration: 'none' }} to='/kids'>Kids</Link>
                    {activeMenu === "kids" ? <hr /> : null}
                </li>
            </ul>
            <div className="nav-login-cart">
                {localStorage.getItem('auth-token')
                ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button>:<Link to='/login'><button>Login</button></Link>}
                
                <Link to='/cart'><img src={cart_icon} alt="cart" /></Link>
                <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
            <div className="menu-toggle" onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z" /><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
            </div>
        </div>
    );
}

export default Navbar;
