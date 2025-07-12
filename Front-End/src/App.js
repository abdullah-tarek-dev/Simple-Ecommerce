import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import './App.css';
// Components
import Home from './components/Home';
import Products from './components/Products';
import Search from './components/Search';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import UserLogin from './components/UserLogin';
import UserSignUp from './components/UserSignUp';
import AdminSignUp from './components/AdminSignUp';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import ReportDashboard from './components/reportdashbord';
import Payment from './components/Payment';

function App() {
  const location = useLocation();
  const hideNavbarPaths = new Set([
    '/', '/signin', '/user-signup', '/admin-login', '/admin-signup','/report', '/admin-panel'
  ]);

  return (
    <>
      {/* If the current path is not in the hideNavbarPaths set, display NavBar */}
      {!hideNavbarPaths.has(location.pathname) && <NavBar />}
      
      <Routes>
        {/* Public User Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/signin" element={<UserLogin />} />
        <Route path="/user-signup" element={<UserSignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/search" element={<Search />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />  {/* Corrected this line */}
        <Route path="/payment" element={<Payment />} />  {/* Corrected this line */}

        {/* Protected Routes */}

        {/* Public Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignUp />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/report" element={<ReportDashboard/>} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
