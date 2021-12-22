const express = require('express')
const userRouter = require('./routes/User')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)


app.listen(port, () => {
    console.log('App is listening on port ' + port)
})

