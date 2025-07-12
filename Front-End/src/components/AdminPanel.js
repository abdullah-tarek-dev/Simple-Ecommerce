import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // لإدارة التعديل

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    const url = editingProductId
      ? `http://localhost:5000/api/products/${editingProductId}` // PUT request
      : 'http://localhost:5000/api/products'; // POST request
  
    const method = editingProductId ? 'PUT' : 'POST';
  
    const token = localStorage.getItem('token'); // ← استرجاع التوكن
    console.log('Token being sent:', token);
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ← إضافة التوكن في الهيدر
        },
        body: JSON.stringify(formData),
      });
  
      console.log(formData);
  
      if (!response.ok) {
        const errorDetails = await response.text(); // Get the error details from the response
        throw new Error(`Failed to add or update product: ${errorDetails}`);
      }
  
      const savedProduct = await response.json();
  
      if (editingProductId) {
        setProducts(products.map((product) => (product.id === savedProduct.id ? savedProduct : product)));
      } else {
        setProducts([...products, savedProduct]);
      }
  
      setFormData({ name: '', description: '', price: '', image: '' });
      setEditingProductId(null);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error adding or updating product: ${error.message}`);
    }
  };
  

  // const handleAddProduct = async (e) => {
  //   e.preventDefault();
    
  //   const { name, description, price, image } = formData; // استخدم formData بدلاً من productData
    
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/products/${editingProductId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name,
  //         description,
  //         price,
  //         image,
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to add or update product');
  //     }
  
  //     const result = await response.json();
  //     console.log(result);
  //     // ... يمكنك إضافة كود لعرض رسالة نجاح أو تحديث واجهة المستخدم هنا.
      
  //     // تحديث قائمة المنتجات في حالة تعديل منتج
  //     if (editingProductId) {
  //       setProducts(products.map((product) => (product.id === result.id ? result : product)));
  //     } else {
  //       setProducts([...products, result]);
  //     }
  
  //     // إعادة تعيين النموذج
  //     setFormData({ name: '', description: '', price: '', image: '' });
  //     setEditingProductId(null);
  
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Error: " + error.message);
  //   }
  // };
  

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorDetails = await response.text(); // الحصول على تفاصيل الخطأ من الاستجابة
        throw new Error(`Failed to delete product: ${errorDetails}`);
      }
  
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error(error);
      alert(`Error deleting product: ${error.message}`); // عرض تفاصيل الخطأ للمستخدم
    }
  };
  

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    });
    setEditingProductId(product.id);
  };

  const handleLogout = () => {
    navigate('/admin-login'); // إعادة التوجيه بعد الخروج
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>Products</li>
          <li>Add Product</li>
          <li onClick={handleLogout}>Logout</li>
          <li><Link to ="/report">reports</Link></li>
        </ul>
      </aside>

      <main className="admin-main">
        <h1>All Products</h1>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="products-list">
            {products.map((product) => (
              <div key={product.id} className="admin-product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <h4>${product.price}</h4>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
                <button onClick={() => handleEdit(product)}>Edit</button>

              </div>
            ))}
          </div>
        )}

<form className="add-product-form" onSubmit={handleAddProduct}>
  <h2>{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
  <input
    type="text"
    name="name"  
    placeholder="Product Name" 
    value={formData.name}
    onChange={handleChange}
    required
  />
  <input
    type="text"
    name="description"
    placeholder="Product Description"
    value={formData.description}
    onChange={handleChange}
    required
  />
  <input
    type="number"
    name="price"
    placeholder="Product Price"
    value={formData.price}
    onChange={handleChange}
    required
  />
  <input
    type="text"
    name="image"
    placeholder="Image URL"
    value={formData.image}
    onChange={handleChange}
    required
  />
  <button type="submit">{editingProductId ? 'Update Product' : 'Add Product'}</button>
</form>

      </main>
    </div>
  );
}

export default AdminPanel;
