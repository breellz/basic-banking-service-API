const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const transactionSchema = new mongoose.Schema({
        owner: {
            type: ObjectID,
            ref: 'User',
            required: true
        },
        destinationAccount: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
        }

}, {
    timestamps: true
})

const Transaction = mongoose.model('transaction', transactionSchema)
module.expoerts = Transaction