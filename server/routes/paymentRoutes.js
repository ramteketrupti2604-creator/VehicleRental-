import express from 'express';
const router = express.Router();


router.post('/create-order', (req, res) => {
  const { amount } = req.body;
  // Mock Razorpay order ID
  const mockOrder = {
    id: 'order_' + Date.now(),
    amount: amount * 100, // paise me
    currency: 'INR',
    status: 'created',
    receipt: 'VR-' + Date.now()
  };
  res.json({ success: true, order: mockOrder, key: 'rzp_test_mockKey' });
});

router.post('/verify', (req, res) => {
  
  res.json({ success: true, message: 'Payment Verified (Mock)', paymentId: 'pay_' + Date.now() });
});

export default router;