// CREATE - Duplicate check with proper message
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({ message: `Category '${name}' already exists` });
    }
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE - Check vehicles
exports.deleteCategory = async (req, res) => {
  const vehiclesCount = await Vehicle.countDocuments({ category: req.params.id });
  if (vehiclesCount > 0) {
    return res.status(400).json({ 
      message: `Cannot delete - ${vehiclesCount} vehicles use this category. Move them first.` 
    });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
};