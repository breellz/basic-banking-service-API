const express = require('express')
const Admin = require('../models/admin')
const adminAuth = require('../middleware/adminAuth')
const User = require('../models/user')
const Transaction = require("../models/transaction");
const generateAccountNumber = require('../utils/generateAccountNumber')

const router = new express.Router()

//create new administrator account
router.post('/admin', async (req, res) => {
    const admin = new Admin(req.body)

    try {
        await admin.save()
        const token = await admin.generateAuthToken()

        res.status(201).send({ admin, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

//create new users
router.post('/admin/users', adminAuth, async (req, res) => {
    const userBody = req.body
    userBody.accountNumber = generateAccountNumber()

    const user = new User({
        createdBy: req.admin._id,
        ...userBody
    })

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

//login administrator account

router.post('/admin/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

//logout
router.post('/admin/logout', adminAuth, async (req, res) => {

    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.admin.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//Logout All 
router.post('/admin/logoutAll', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//reverse a transaction

router.post('/admin/transactions/reverse/:transactionId', adminAuth, async (req, res) => {
    const { transactionId } = req.params
    try {
        //fetch the transaction by it's Id
        const transaction = await Transaction.findOne({ _id: transactionId })
        //check if there's is no transaction or transaction has already been reversed
        if (!transaction || transaction.isReversed === true ) {
           throw new Error
        }
        //Reverse a deposit  or withdrawal transaction 
        if(transaction.transactionType === 'DEPOSIT' || 'WITHDRAW' ) {
            //Fetch the user account and correct their balance
            const user = await User.findOne({ _id: transaction.owner })
            if(!user) {
                res.status(404).send({message: "no user was found"})
            }
            if(transaction.transactionType === 'DEPOSIT') {
                user.accountBalance -= transaction.amount
            } else {
                user.accountBalance += transaction.amount
            }
            
            await user.save()
            //mark transaction as reversed
            transaction.isReversed = true;
            await transaction.save()
            res.status(200).send({user, transaction})
        }
        //Reverse a withdrawal transaction
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})
module.exports = router