const express = require('express')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const transactionRouter = require('./routes/transaction')

require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(transactionRouter)



app.listen(port, () => {
    console.log('App is listening on port ' + port)
})

