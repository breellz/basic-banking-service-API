const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Admin = require('../src/models/admin')
const User = require('../src/models/user')
const Transaction = require('../src/models/transaction')

const adminOneId = new mongoose.Types.ObjectId()
const userOneId = new mongoose.Types.ObjectId()

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
    password: "23454345",
    tokens : [{
        token: jwt.sign({_id:userOneId }, 'bankingapi')
    }]
}

beforeEach(async () => {
    await Admin.deleteMany()
    await User.deleteMany()
    await new Admin(adminOne).save()
    await new User(userOne).save()
})

describe('All tests related to admin signup & login', () => {
    test('Should sign up new administrator', async () => {
      const response = await request(app).post('/admin').send({
            userName: "Bassit",
            email: "h@p.com",
            password: "23454345"
        }).expect(201)

      // assert that the database was changed correctly
      const admin = await Admin.findById(response.body.admin._id)
      expect(admin).not.toBeNull()
      //assertions about the response 
      expect(response.body).toMatchObject({
          admin: {
            userName: "bassit",
            email: "h@p.com",
            isAdmin: true
          },
          token : admin.tokens[0].token
      })
      expect(admin.password).not.toBe('23454345')
    })

    test('Should trigger an error if a required field is absent', async () => {
        await request(app).post('/admin').send({
            userName: "Bassit",
            password: "23454345"
        }).expect(400)
    })
    
    test('Should trigger an error if admin already exists', async () => {
        await request(app).post('/admin')
            .send(adminOne).expect(400)
    })
    
    test("Should log in existing administrator", async () => {
       const response = await request(app).post('/admin/login').send({
            email: "h@g.com",
            password: "23454345"
        }).expect(200)
        // assert that token is added and valid
        const admin = await Admin.findById(adminOneId)
        expect(response.body.token).toBe(admin.tokens[1].token)
    })

    test("should not log in non-existent admin", async () => {
        await request(app).post('/admin/login').send({
            email: "h@e.com",
            password: "23454345"
        }).expect(400)
    })
})

describe('All test cases related to admin privileges on users', () => {
    test('Should create new users', async () => {
        await request(app)
            .post('/admin/users')
            .set('Authorization', `Bearer ${adminOne.tokens[0].token}`)
            .send({
                firstName: "kart",
                lastName: "owolabi",
                email: "h@j.com",
                password: "23454345"
            }).expect(201)
    })
    test('should not create users for unauthenticated admin', async () => {
        await request(app)
            .post('/admin/users')
            .send({
                firstName: "kart",
                lastName: "owolabi",
                email: "h@j.com",
                password: "23454345"
            }).expect(401)
    })
    // test('should reverse a deposit transaction', async() => {

    // })
    test('should delete a user', async() => {
        const response = await request(app)
        .delete(`/admin/users/${userOneId}`)
        .set('Authorization', `Bearer ${adminOne.tokens[0].token}`)
        .send()
        .expect(200)

        // assert user was deleted
        const user = await User.findById(response.body._id);
        expect(user).toBeNull()
    })

    test('should disable a user account', async () => {
        const response = await request(app)
        .post(`/admin/users/${userOneId}`)
        .set('Authorization', `Bearer ${adminOne.tokens[0].token}`)
        .send()
        .expect(200)

        // assert user was deleted
        const user = await User.findById(response.body._id);
        expect(user.isDisabled).toBe(true)
    })
})
