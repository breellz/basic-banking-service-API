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



module.exports = app

