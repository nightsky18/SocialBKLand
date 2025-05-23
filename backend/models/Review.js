const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: String,
    default: 'Anónimo',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Método estático para recalcular promedio
reviewSchema.statics.recalculateAverage = async function (bookId) {
  const reviews = await this.find({ libro: bookId });
  if (reviews.length === 0) return;

  const average =
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

  await mongoose.model('Book').findByIdAndUpdate(bookId, { rating: average });
};

// Hooks
reviewSchema.post('save', async function () {
  await this.constructor.recalculateAverage(this.libro);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await doc.constructor.recalculateAverage(doc.libro);
});

// Exportación directa
module.exports = mongoose.model('Review', reviewSchema);
