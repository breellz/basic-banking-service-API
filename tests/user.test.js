const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Admin = require('../src/models/admin')
const User = require('../src/models/user')
const { userOneId, setUpDatabase } = require('../tests/fixtures/db')

beforeEach(setUpDatabase)


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