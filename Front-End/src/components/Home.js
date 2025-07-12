import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import Card from './Card';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // جلب بيانات المنتجات
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });

    // جلب بيانات اليوزر لو مسجل دخول
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="home-container">
      <div className="home">
        <header className="home-header">
          <h1>Welcome to MiniShop{user ? `, ${user.name || user.email}!` : '!'}</h1>
          <p>Your favorite place to find amazing products at great prices.</p>
        </header>

        <section className="featured-products">
          <h2>Featured Products</h2>
          {loading ? (
            <p className="loading">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.slice(0, 4).map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="no-products">No products available at the moment.</p>
          )}
        </section>

        <section className="cta">
          <h2>Start Shopping Now!</h2>
          <p>Check out all our awesome products.</p>
          <Link to="/products" className="cta-button">
            View Products
          </Link>
        </section>
      </div>
    </div>
  );
}

export default Home;
