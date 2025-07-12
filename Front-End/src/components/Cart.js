// ✅ cart.js
import React, { useState, useEffect, useContext } from 'react';
import '../styles/Cart.css';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { cartItems, updateCartItems } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(response => {
          const data = response.data;
          if (Array.isArray(data)) {
            updateCartItems(data);
            const total = data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setTotalPrice(total);
          } else {
            console.error('المعلومات المسترجعة ليست مصفوفة:', data);
          }
        })
        .catch(error => {
          console.error('Error fetching cart items:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [user, token, updateCartItems]);

  const handlePlaceOrder = () => {
    if (!user || !token) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (cartItems.length === 0) {
      alert('سلتك فارغة. يرجى إضافة بعض المنتجات.');
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        total_price: totalPrice
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to place order');
        return res.json();
      })
      .then(orderData => {
        const createdOrderId = orderData.orderId;
        alert('تمت عملية الشراء بنجاح!');
        return fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          updateCartItems([]);
          setTotalPrice(0);
          navigate('/payment', { state: { orderId: createdOrderId, totalPrice: totalPrice } });
        });
      })
      .catch(error => {
        console.error('Error placing order:', error);
        alert('حدث خطأ أثناء تقديم الطلب. حاول مرة أخرى.');
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div>جاري تحميل السلة...</div>;

  return (
    <div className="cart-container">
      <h2>سلة المشتريات</h2>
      {cartItems.length === 0 ? (
        <p>سلتك فارغة!</p>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>الكمية: {item.quantity}</p>
                <p>السعر: ${item.price}</p>
                <p>الإجمالي: ${item.quantity * item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <h3>الإجمالي: ${totalPrice}</h3>
      <button onClick={handlePlaceOrder}>إتمام الطلب</button>
    </div>
  );
};

export default Cart;