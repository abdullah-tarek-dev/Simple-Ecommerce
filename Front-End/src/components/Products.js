import React, { useState, useEffect } from 'react';
import Card from './Card';
import '../styles/Products.css';

function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [visibleProductsCount, setVisibleProductsCount] = useState(8); // عدد المنتجات المعروضة
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);  // كل المنتجات
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  const loadMoreProducts = () => {
    setVisibleProductsCount(prevCount => prevCount + 8); // زيادة عدد المنتجات المعروضة
  };

  return (
    <div className="container">
      <div className="products-container">
        <h1 className="products-header">
          All Products {!loading && <span className="product-count">({allProducts.length})</span>}
        </h1>

        {loading ? (
          <p className="loading-text">Loading products... ⏳</p>
        ) : (
          <div className="products-grid">
            {allProducts.slice(0, visibleProductsCount).map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && visibleProductsCount < allProducts.length && (
          <button className="load-more" onClick={loadMoreProducts}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default Products;
