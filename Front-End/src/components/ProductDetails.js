import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ProductDetails.css';
import { CartContext } from './CartContext';
import { AuthContext } from './AuthContext';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  // const { setCartItems } = useContext(CartContext);
  const { updateCartItems } = useContext(CartContext);
  const { user , token } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setProduct(data);
        } else {
          setProduct(null);
          setError('product not found');
        }
      })
      .catch(err => {
        setError('faild get on product');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      alert('product not found');
      return;
    }

    if (!user) {
      alert('please log in firstly');
      return;
    }

    if (quantity < 1) {
      alert('quantity must at least 1');
      return;
    }

    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: quantity,
        price: product.price,
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('faild to add to cart ');
      }
      return res.json();
    })
    .then(() => {
      return fetch('http://localhost:5000/api/cart', {
        headers: {
         'Authorization': `Bearer ${token}`,
        }
      });
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('faild in get cart');
      }
      return res.json();
    })
    .then(data => {
      updateCartItems(data.data); // لاحظ أنك ترجعها داخل `data`
      alert('✅ product added to cart');
    })
    .catch(err => {
      console.error(err);
      alert(err.message || '⚠️ error try again');
    });
    
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value, 10));
    setQuantity(isNaN(value) ? 1 : value);
  };

  if (loading) return <div>load product ...</div>;

  if (error) return <div>{error}</div>;

  if (!product) return <div>product not found</div>;

  return (
    <div className="product-details">
      <img src={product.image} alt={product.title} />
      <div className="details">
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <h3>${product.price}</h3>
        
        <div>
          <label>quantity : </label>
          <input type="number" min="1" value={quantity} onChange={handleQuantityChange} />
        </div>
        
        <button onClick={handleAddToCart}>Add to cart 🛒</button>
      </div>
    </div>
  );
}

export default ProductDetails;
