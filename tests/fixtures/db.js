const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Admin = require('../../src/models/admin')
const User = require('../../src/models/user')
const Transaction = require('../../src/models/transaction')



const adminOneId = new mongoose.Types.ObjectId()
const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()

const adminOne = {
    _id: adminOneId,
    userName: "Breellz",
    email: "h@g.com",
    password: "23454345",
    tokens: [{
        token: jwt.sign({ _id: adminOneId }, 'bankingapi')
    }]
}

const userOne = {
    _id: userOneId,
    firstName: "katy",
    lastName: "Adams",
    email: "k@a.com",
    createdBy: adminOneId,
    accountNumber: 345879234,
    accountBalance: 10000,
    password: "23454345",
    tokens : [{
        token: jwt.sign({_id:userOneId }, 'bankingapi')
    }]
}

const userTwo = {
    _id: userTwoId,
    firstName: "katherine",
    lastName: "Phelps",
    email: "f@g.com",
    isDisabled: true,
    createdBy: adminOneId,
    accountNumber: 343879234,
    password: "23454345",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, 'bankingapi')
    }]
}
const transactionOne = {
    owner: userOneId,
    transactionType: 'DEPOSIT',
    amount: 4000
}
const transactionTwo = {
    owner: userOneId,
    transactionType: 'WITHDRAW',
    amount: 4000
}
const setUpDatabase = async () => {
    await Admin.deleteMany()
    await User.deleteMany()
    await new Admin(adminOne).save()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Transaction(transactionOne).save()
    await new Transaction(transactionTwo).save()
}

module.exports = {
    adminOne,
    adminOneId,
    userOneId,
    userOne,
    setUpDatabase,
    userTwo,
    userTwoId
}