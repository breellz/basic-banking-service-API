const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, adminOne, adminOneId, setUpDatabase, userTwo } = require('./fixtures/db')

beforeEach(setUpDatabase)


describe('All tests related to transactions', () => {
    test('Should create a withdrawal transaction', async () => {

        await request(app)
            .post('/transactions/withdraw')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                amount: 3000
            }).expect(200)

    })
    test('should not create transaction if amount to be withdrawn is greater than account balance', async () => {
        await request(app)
            .post('/transactions/withdraw')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                amount: 3000000000
            }).expect(400)
    })
    test('Should create a deposit transaction', async () => {

        await request(app)
            .post('/transactions/deposit')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                amount: 3000
            }).expect(200)

    })
    test('should transfer funds to another account', async () => {
        const response = await request(app)
            .post('/transactions/transfer')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                destinationAccount: userTwo.accountNumber,
                amount: 5000,
                description: "manage this"
            }).expect(201)
        //assert that user account was reduced by the right amount and recipient was credited with the same amount
        expect(response.body.user.accountBalance).toBe(5000)
        expect(response.body.recepient.accountBalance).toBe(5000)
    })
    test('should not transfer if user does not have enough funds', async() => {
        await request(app)
            .post('/transactions/transfer')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                destinationAccount: userTwo.accountNumber,
                amount: 15000,
                description: "manage this"
            }).expect(400)
    })
    test('should not transfer if recipient with the account number provided does not exist', async() => {
        await request(app)
            .post('/transactions/transfer')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                destinationAccount: 843832823823,
                amount: 1000,
                description: "manage this"
            }).expect(404)
    })
    test('Should get a specific type of transaction', async() => {
      const response =   await request(app)
        .get('/transactions/specific?type=DEPOSIT')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
        //assert that the transaction gooten is deposit 
    expect(response.body[0].transactionType).toBe('DEPOSIT')
    })
    test('should fetch all transactions', async() => {
        await request(app)
        .get('/transactions')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    })
})