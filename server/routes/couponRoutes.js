import express from 'express';
import Coupon from '../models/couponModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', async (req,res)=>{
  const coupons = await Coupon.find().sort({createdAt:-1});
  res.json(coupons);
});

router.post('/', protect, admin, async (req,res)=>{
  try{
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  }catch(e){ res.status(400).json({message:e.message}) }
});

router.post('/validate', protect, async (req,res)=>{
  try{
    const { code, totalAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if(!coupon) return res.status(404).json({message:"Invalid coupon"});
    if(new Date() > coupon.expiryDate) return res.status(400).json({message:"Expired"});
    if(coupon.usedCount >= coupon.usageLimit) return res.status(400).json({message:"Limit reached"});
    if(totalAmount < coupon.minAmount) return res.status(400).json({message:`Min ₹${coupon.minAmount} required`});
    let discount = coupon.discountType === 'PERCENT'? (totalAmount * coupon.discountValue / 100) : coupon.discountValue;
    if(coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    res.json({ valid:true, discount, finalAmount: totalAmount - discount, coupon });
  }catch(e){ res.status(500).json({message:e.message}) }
});

router.delete('/:id', protect, admin, async (req,res)=>{
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({message:"Deleted"});
});

export default router;