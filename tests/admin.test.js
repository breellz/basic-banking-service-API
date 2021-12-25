const request = require('supertest')
const app = require('../src/app')
const Admin = require('../src/models/admin')

beforeEach( async() => {
    await Admin.deleteMany()
})

describe('All tests related to admin routes', () => {
    test('Should sign up new administrator', async () => {
        await request(app).post('/admin').send({ 
            "userName": "Bassit",
            "email": "h@p.com",
            "password":"23454345"
         }).expect(201)
    })
})