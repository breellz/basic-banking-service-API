const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Admin = require('../src/models/admin')
const User = require('../src/models/user')
const Transaction = require('../src/models/transaction')

const adminOneId = new mongoose.Types.ObjectId()
const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    firstName: "katy",
    lastName: "Adams",
    email: "k@a.com",
    createdBy: adminOneId,
    accountNumber: 345879234,
    password: "23454345",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, 'bankingapi')
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
const adminOne = {
    _id: adminOneId,
    userName: "Breellz",
    email: "h@g.com",
    password: "23454345",
    tokens: [{
        token: jwt.sign({ _id: adminOneId }, 'bankingapi')
    }]
}

beforeEach(async () => {
    await Admin.deleteMany()
    await User.deleteMany()
    await new Admin(adminOne).save()
    await new User(userOne).save()
    await new User(userTwo).save()
})

describe('All tests related to user route', () => {
    test('should log in existing user', async () => {
        const response = await request(app).post('/users/login').send({
            email: "k@a.com",
            password: "23454345"
        }).expect(200)
        // assert that token is added and valid
        const user = await User.findById(userOneId)
        expect(response.body.token).toBe(user.tokens[1].token)
    })
    test("should not log in non-existent user", async () => {
        await request(app).post('/users/login').send({
            email: "barseet@ijg.com",
            password: "23454345"
        }).expect(400)
    })
    test("should not log in a disabled user", async () => {
        const response = await request(app).post('/users/login').send({
            email: "f@g.com",
            password: "23454345"
        }).expect(400)
    })
})