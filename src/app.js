const path = require('path');
const express = require('express')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const transactionRouter = require('./routes/transaction')

require('./db/mongoose')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(transactionRouter)

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))

app.get('/', (req, res) => {
    res.sendFile('index.html')
})
module.exports = app

