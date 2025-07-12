import React, { useState } from 'react';
import axios from 'axios';

const AddToCart = ({ userId, product }) => {
  const [quantity, setQuantity] = useState(1);

  // دالة إضافة المنتج إلى السلة
  const handleAddToCart = () => {
    if (quantity < 1) {
      alert('الكمية يجب أن تكون على الأقل 1');
      return;
    }

    const price = product.price;

    // إرسال الطلب لإضافة المنتج إلى السلة
    axios.post('http://localhost:5000/api/cart', {
      user_id: userId,
      product_id: product.id,
      quantity,
      price,
    })
      .then(response => {
        alert('تم إضافة المنتج إلى السلة');
      })
      .catch(error => {
        console.error('حدث خطأ أثناء إضافة المنتج إلى السلة:', error);
        alert('فشل في إضافة المنتج إلى السلة');
      });
  };

  // تحديث الكمية
  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value, 10)); // التأكد من أن الكمية لا تقل عن 1
    setQuantity(isNaN(value) ? 1 : value); // في حال كانت القيمة المدخلة غير عددية
  };

  return (
    <div>
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <p>${product.price}</p>
      
      {/* حقل الكمية */}
      <input
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        min="1"
      />
      
      {/* زر إضافة إلى السلة */}
      <button onClick={handleAddToCart}>أضف إلى السلة</button>
    </div>
  );
};

export default AddToCart;
