import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import '../styles/Search.css';
import Card from './Card';

function Search() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce effect to wait for the user to stop typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // تأخير 500 مللي ثانية قبل إرسال البحث
    return () => clearTimeout(timer); // تنظيف الـ timer عند تغييره
  }, [searchTerm]);

  useEffect(() => {
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
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="search-container">
      <h1>Search Products</h1>
      <div className="search-info">
        {filteredProducts.length > 0
          ? `${filteredProducts.length} products found`
          : 'No products found'}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <Card key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="no-results">No results found</p>
      )}
    </div>
  );
}

export default Search;
