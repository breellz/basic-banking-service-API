const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Transaction = require('../models/transaction')
const ObjectID = mongoose.Schema.Types.ObjectId

const userSchema = new mongoose.Schema({
    createdBy: {
        type: ObjectID,
        ref: 'Admin',
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate( value ) {
            if( !validator.isEmail( value )) {
                throw new Error( 'Email is invalid' )
            }
        }
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    accountNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    accountBalance : {
        type: Number,
        default: 0,
        min: 0
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if( value.toLowerCase().includes('password')) {
                throw new Error('password musn\'t contain password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

//get public profile 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//Generate auth token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, 'bankingapi')
    user.tokens = user.tokens.concat({token})
     await user.save()
    return token
}

//login in users
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to log in')
    }
    //check if user account is isDisabled and restrict access
    if(user.isDisabled === true) {
        throw new Error('Your account is disabled, please contact support for further assistance')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Hash plain password before saving
userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete user transactions when a user is deleted

userSchema.pre('remove', async function(next) {
    const user = this
    await Transaction.deleteMany({ owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
