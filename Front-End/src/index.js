import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './components/CartContext'; 
import { AuthProvider } from './components/AuthContext'; // استيراد AuthProvider


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
    <CartProvider>
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
      </CartProvider>
      </AuthProvider>
);

reportWebVitals();
