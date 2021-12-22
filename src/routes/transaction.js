const express = require("express");
const Transaction = require("../models/transaction");
const Auth = require("../middleware/auth");

const router = new express.Router();

//withdrawal route
router.post('/transaction/withdraw', Auth, async(req, res) => {
  const { amount } = req.body;
  try {
    const user = req.user
   
    //check if user has sufficient balance to make withdrawal request

    if( user.accountBalance >= amount ) {
      const transaction = new Transaction({
        owner: user._id,
        transactionType: 'WITHDRAW',
        ...req.body
    })
    await transaction.save()
    user.accountBalance -= amount
    await user.save();
    res.status(200).send(transaction)
    } else {
      res.status(400).send({error: "Insufficient balance"})
    }
        
  } catch (error) {
    res.status(400).send(error);
  }
})

//make a deposit
router.post("/transaction/deposit", Auth, async (req, res) => {
  const { amount } = req.body;

  try {
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
      res.status(200).send(transaction);

  } catch (error) {
    res.status(400).send(error);
  }
});

//make transfer to another account

router.post('/transaction/transfer', Auth, async( req, res ) => {
  try {
    
  } catch (error) {
    res.status(400).send(error)
  }
})


module.exports = router;
