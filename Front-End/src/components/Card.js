import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Card.css';

function Card({ product }) {
  const imageSrc = product.image || '../logo.svg';

  return (
    <div className="product-card">
      <img src={imageSrc} alt={product.name || 'Product image'} className="product-img" />
      <h3>{product.name?.length > 25 ? product.name.slice(0, 20) + '...' : product.name}</h3>
      <p>{product.description?.length > 50 ? product.description.slice(0, 50) + '...' : product.description}</p>
      <h4>${product.price}</h4>
      <Link to={`/products/${product.id}`} className="details-button">
        View Details
      </Link>
    </div>
  );
}

export default Card;
