import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/payment.css';
import { AuthContext } from '../components/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalPrice } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!orderId || !totalPrice) {
      alert('بيانات الطلب غير مكتملة، لا يمكن متابعة الدفع.');
      navigate('/');
    }
  }, [orderId, totalPrice, navigate]);

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        order_id: orderId,
        amount: totalPrice,
        method: paymentMethod,
        status: paymentMethod === 'Credit Card' ? 'Completed' : 'Pending'
      };

      console.log('📤 سيتم الإرسال:', payload);

      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'فشل حفظ الدفع');

      alert(result.message || 'تم الدفع بنجاح 🎉');
      navigate('/');
    } catch (error) {
      console.error('Payment Error:', error);
      alert(`حدث خطأ أثناء تنفيذ الدفع: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>صفحة الدفع</h2>
      <p>المبلغ المستحق: <strong>{totalPrice} دينار</strong></p>

      <div className="payment-method">
        <label>
          <input
            type="radio"
            value="Credit Card"
            checked={paymentMethod === 'Credit Card'}
            onChange={() => setPaymentMethod('Credit Card')}
          />
          بطاقة ائتمان
        </label>
        <label>
          <input
            type="radio"
            value="PayPal"
            checked={paymentMethod === 'PayPal'}
            onChange={() => setPaymentMethod('PayPal')}
          />
          PayPal
        </label>
        <label>
          <input
            type="radio"
            value="Cash"
            checked={paymentMethod === 'Cash'}
            onChange={() => setPaymentMethod('Cash')}
          />
          الدفع نقدًا عند الاستلام
        </label>
        <label>
          <input
            type="radio"
            value="Bank Transfer"
            checked={paymentMethod === 'Bank Transfer'}
            onChange={() => setPaymentMethod('Bank Transfer')}
          />
          تحويل بنكي
        </label>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        {paymentMethod === 'Credit Card' && (
          <>
            <input
              type="text"
              name="name"
              placeholder="اسم حامل البطاقة"
              value={cardDetails.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="number"
              placeholder="رقم البطاقة"
              value={cardDetails.number}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="expiry"
              placeholder="تاريخ الانتهاء (MM/YY)"
              value={cardDetails.expiry}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              required
            />
          </>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'جارٍ الدفع...' : 'تأكيد الدفع'}
        </button>
      </form>
    </div>
  );
};

export default Payment;
