const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add product name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      enum: ['Pesticides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Farming Tools']
    },
    price: {
      type: Number,
      required: [true, 'Please add product price']
    },
    discount: {
      type: Number,
      default: 0 // percentage, e.g. 10 for 10% off
    },
    description: {
      type: String,
      required: [true, 'Please add product description']
    },
    usageDetails: {
      type: String,
      required: [true, 'Please add usage details']
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock availability'],
      min: [0, 'Stock cannot be negative']
    },
    images: {
      type: [String],
      default: []
    },
    manufacturingDetails: {
      manufacturer: { type: String, default: '' },
      expiryDate: { type: Date },
      batchNumber: { type: String, default: '' }
    },
    ratings: {
      type: Number,
      default: 0
    },
    reviews: [ReviewSchema]
  },
  { timestamps: true }
);

// Method to calculate average rating from reviews array
ProductSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings = parseFloat((sum / this.reviews.length).toFixed(1));
  }
};

module.exports = mongoose.model('Product', ProductSchema);
