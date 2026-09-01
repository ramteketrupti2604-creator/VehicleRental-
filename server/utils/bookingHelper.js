
const calculateRentalDays = (pickup, returnD) => {
  const diffTime = new Date(returnD) - new Date(pickup);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


const generateBookingNumber = async () => {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const count = await Booking.countDocuments() + 1;
  return `VR-${date}-${String(count).padStart(4, '0')}`;
};

module.exports = { calculateRentalDays, generateBookingNumber };