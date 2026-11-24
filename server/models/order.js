const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [{
        id: String,
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    shippingAddress: {
        type: String,
        required: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery'],
        default: 'cash_on_delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['placed', 'cancelled', 'delivered'],
        default: 'placed'
    }
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema)
