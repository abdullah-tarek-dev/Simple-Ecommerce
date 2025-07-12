import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import '../styles/NavBar.css';

function NavBar() {
  // const { cartItems, setCartItems } = useContext(CartContext);
  const { cartItems, updateCartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) return;
  
    // منع التكرار إذا تم جلب بيانات هذا المستخدم بالفعل
    const lastFetchedId = localStorage.getItem("lastFetchedUserId");
    if (lastFetchedId && parseInt(lastFetchedId) === user.id) return;
  
    localStorage.setItem("lastFetchedUserId", user.id);
  
    if (user.isAdmin) {
      setIsAdminLoggedIn(true);
    }
  
    // console.log("user.id:", user.id);
    // console.log("userToken:", localStorage.getItem("userToken"));
  
    fetch(`http://localhost:5000/api/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch cart items');
        }
        return res.json();
      })
      .then(result => {
        if (Array.isArray(result.data)) {
          updateCartItems(result.data);
        } else {
          console.error('Received data is not an array:', result);
          updateCartItems([]);
        }
      })
      .catch(error => {
        console.error('Error fetching cart items:', error);
        updateCartItems([]);
      });
  
  }, [user, updateCartItems]);
  

  const handleLogout = () => {
    logout();
    setIsAdminLoggedIn(false);
    // setCartItems([]);
    updateCartItems([]);
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">MiniShop</Link>
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>

      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link></li>
        <li><Link to="/search" onClick={() => setMenuOpen(false)}>Search</Link></li>

        <li>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            🛒 Cart ({cartItems.length})
          </Link>
        </li>

        {!user ? (
          <li><Link to="/signin" onClick={() => setMenuOpen(false)}>LogIn</Link></li>
        ) : (
          <>
            {isAdminLoggedIn && (
              <li><Link to="/admin-panel" onClick={() => setMenuOpen(false)}>Admin Panel</Link></li>
            )}
            <li>
              <button className="logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;