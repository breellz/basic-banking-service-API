const express = require("express");
const Transaction = require("../models/transaction");
const User = require("../models/user")
const Auth = require("../middleware/userAuth");

const router = new express.Router();

//withdrawal route
router.post('/transactions/withdraw', Auth, async (req, res) => {
  const { amount } = req.body;
  try {
    if(typeof(amount) === 'string') {
      res.status(400).send({error: "amount must be a number"})
      return
    }
    const user = req.user

    //check if user has sufficient balance to make withdrawal request

    if (user.accountBalance >= amount) {
      const transaction = new Transaction({
        owner: user._id,
        transactionType: 'WITHDRAW',
        ...req.body
      })
      await transaction.save()
      user.accountBalance -= amount
      await user.save();
      res.status(200).send({transaction, user})
    } else {
      res.status(400).send({ error: "Insufficient balance" })
    }

  } catch (error) {
    res.status(400).send(error);
  }
})

//make a deposit
router.post("/transactions/deposit", Auth,  async (req, res) => {
  const { amount } = req.body;

  try {
    if(typeof(amount) === 'string') {
      res.status(400).send({error: "amount must be a number"})
      return
    }
    //deposit money
    const user = req.user;
    //create a new transaction and save
    const transaction = new Transaction({
      owner: user._id,
      transactionType: 'DEPOSIT',
      ...req.body
    })
    await transaction.save()
    user.accountBalance += amount;
    await user.save();
    res.status(200).send({transaction, user});

  } catch (error) {
    res.status(400).send(error);
  }
});

//make transfer to another account

router.post('/transactions/transfer', Auth,  async (req, res) => {
  const { destinationAccount, amount } = req.body
  try {
    if(!destinationAccount || typeof(amount) !== 'number' ) {
      throw new Error('Destination account and amount are required and must be of type number')
    }
    const user = req.user
    //check if user has enough money in his account to transfer
    if (user.accountBalance >= amount) {
      const recepient = await User.findOne({ accountNumber: destinationAccount })
      //check if there is a user with the specified account
      if (recepient) {
        //create a transfer transaction for the current user 
        const transfer = new Transaction({
          owner: user._id,
          transactionType: 'TRANSFER',
          originatingAccount: user.accountNumber,
          ...req.body
        })
        await transfer.save()
        //create a credit transaction for the recepient
        const credit = new Transaction({
          owner: recepient._id,
          transactionType: 'CREDIT',
          originatingAccount: user.accountNumber,
          ...req.body
        })
        await credit.save()
        //make necessary deductions and additions to various accounts
        user.accountBalance -= amount
        await user.save();
        recepient.accountBalance += amount
        await recepient.save();
        res.status(201).send({ user, recepient, transfer, credit })

      } else {
        res.status(404).send({ message: "no user with that account number" })
      }

    } else {
      res.status(400).send({ error: "insufficient balance" })
    }

  } catch (error) {
    res.status(400).send({error: error.message})
  }
})

//Get a specific type of transaction, it could be a TRANSFER, DEPOSIT, WITHDRAW or CREDIT

router.get('/transactions/specific', Auth, async (req, res) => {

  if (!req.query.type) {
    res.status(400).send({ message: 'Please specify transaction type ' })
  }
  const transactionType = req.query.type
  try {
    const transactions = await Transaction.find({ owner: req.user._id, transactionType }).sort({ createdAt: -1 }).exec()
     if ( transactions.length === 0 ) {
       res.status(404).send({ message: `You have not made any ${transactionType} transaction`})
     } 
      res.send(transactions)
 
  } catch (error) {
    res.status(400).send()
  }
})

//Fetch all transactions 
router.get('/transactions', Auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ owner : req.user._id }, null, {sort:{ createdAt: -1}})
    res.send(transactions)
  } catch (error) {
    res.status(400).send()
  }
})



module.exports = router;
