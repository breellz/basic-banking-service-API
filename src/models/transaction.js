const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const transactionSchema = new mongoose.Schema({
        owner: {
            type: ObjectID,
            ref: 'User',
            required: true
        },
        isReversed: {
            type: Boolean,
            default: false,
        },
        transactionType : {
            type: String,
            enum: ['DEPOSIT', 'TRANSFER', 'WITHDRAW', 'CREDIT'],
            required: true
        }, 
        destinationAccount: {
            type: Number,
        },
        originatingAccount: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
        }

}, {
    timestamps: true
})

const Transaction = mongoose.model('transaction', transactionSchema)
module.exports = Transaction