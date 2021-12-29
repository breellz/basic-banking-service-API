const express = require('express')
const Admin = require('../models/admin')
const adminAuth = require('../middleware/adminAuth')
const User = require('../models/user')
const Transaction = require("../models/transaction");
const generateAccountNumber = require('../utils/generateAccountNumber')
const { validationRules, validate } = require('../middleware/validators/Login')

const router = new express.Router()

//create new administrator account
router.post('/admin', validationRules(), validate, async (req, res) => {
    const admin = new Admin(req.body)

    try {
        await admin.save()
        const token = await admin.generateAuthToken()

        res.status(201).send({ admin, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

//create new users
router.post('/admin/users', validationRules(), validate, adminAuth, async (req, res) => {
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
        res.status(400).send(error)
    }

})

//login administrator account

router.post('/admin/login',  validationRules(), validate, async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

//logout adminstrator account
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

//Logout All administrator login sessions
router.post('/admin/logoutAll', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//reverse a deposit transaction

router.post('/admin/transactions/reverse/deposit/:transactionId', adminAuth, async (req, res) => {
    const { transactionId } = req.params
    try {
        //fetch the transaction by it's Id
        const transaction = await Transaction.findOne({ _id: transactionId })
        //check if there's is no transaction or transaction has already been reversed
        if (!transaction || transaction.isReversed === true) {
            return res.status(400).send({message: "transaction does not exist or is already reversed"})
            
        }
        //Fetch the user account and correct their balance

        const user = await User.findOne({ _id: transaction.owner })
        if (!user) {
           return res.status(404).send({ message: "no user was found" })
        }
        user.accountBalance -= transaction.amount

        await user.save()
        //mark transaction as reversed
         transaction.isReversed = true;
        await transaction.save()
        res.status(200).send({ user, transaction })

    } catch (error) {
        res.status(400).send(error)
    }
})

//reverse a withdrawal transaction
router.post('/admin/transactions/reverse/withdrawal/:transactionId', adminAuth, async (req, res) => {
    const { transactionId } = req.params
    try {
        //fetch the transaction by it's Id
        const transaction = await Transaction.findOne({ _id: transactionId })
        //check if there's is no transaction or transaction has already been reversed
        if (!transaction || transaction.isReversed === true) {
            return res.status(400).send({message: "transaction does not exist or is already reversed"})
        }
        //Fetch the user account and correct their balance

        const user = await User.findOne({ _id: transaction.owner })
        if (!user) {
            res.status(404).send({ message: "no user was found" })
        }
        user.accountBalance += transaction.amount

        await user.save()
        //mark transaction as reversed
        transaction.isReversed = true;
        await transaction.save()
        res.status(200).send({ user, transaction })

    } catch (error) {
        res.status(400).send(error)
    }
})

//reverse a transfer transaction

router.post('/admin/transactions/reverse/transfer/:transactionId', adminAuth, async(req, res) => {
 //Reverse a TRANSFER transaction
 const { transactionId } = req.params
 try {
     //fetch the transaction by it's Id
     const transaction = await Transaction.findOne({ _id: transactionId })
     //check if there's is no transaction or transaction has already been reversed
     if (!transaction || transaction.isReversed === true) {
        return res.status(400).send({message: "transaction does not exist or is already reversed"})
    }
    //fetch both the owner and recipient 
    const owner = await User.findOne({ accountNumber: transaction.originatingAccount })
    const recepient = await User.findOne({ accountNumber: transaction.destinationAccount })
    if(!owner || !recepient) {
        return res.status(400).send({message: "owner or recepient not found"})
    }
    owner.accountBalance += transaction.amount
    recepient.accountBalance -= transaction.amount
    await owner.save()
    await recepient.save()
    transaction.isReversed = true
    await transaction.save()
    res.send({ owner, recepient, transaction})  
 } catch (error) {
     res.status(400).send(error)
 }  
})

//delete user 
router.delete('/admin/users/:userId', adminAuth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId })
        if(!user) {
            return res.status(400).send({message: 'User not found'})
        }
        await user.remove()
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

/*disable user account 
switch isDisabled property to true, then make sure all disabled users don't have access */

router.post('/admin/users/:userId', adminAuth, async(req, res) => {
    try {
        const user = await User.findOne({ _id : req.params.userId})
        if(!user) {
            return res.status(400).send({message: 'User not found'})
        }
        user.isDisabled = true
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router