const express = require('express')
const Admin = require('../models/admin')
const adminAuth = require('../middleware/adminAuth')
const User = require('../models/user')
const generateAccountNumber = require('../utils/generateAccountNumber')

const router = new express.Router()

//create new administrator account
router.post('/admin', async (req, res) => {
    const admin = new Admin(req.body)

    try {
        await admin.save()
        const token = await admin.generateAuthToken()
       
        res.status(201).send({admin, token})
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
       
        res.status(201).send({user, token})
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

module.exports = router