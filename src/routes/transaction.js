const express = require("express");
const Transaction = require("../models/transaction");
const Auth = require("../middleware/auth");

const router = new express.Router();

//Create a new transaction
router.post("/transaction", Auth, async (req, res) => {
  const { transactionType, amount } = req.body;

  try {
    //deposit money
    const deposit = async () => {
      const user = req.user;
      //create a new transaction and save
      const transaction = new Transaction({
          owner: user._id,
          ...req.body
      })
      await transaction.save()
      user.accountBalance += amount;
      await user.save();
      res.status(200).send(user);
    };

    //withdraw money
    const withdraw = async () => {
        const user = req.user
        const transaction = new Transaction({
            owner: user._id,
            ...req.body
        })
        await transaction.save()
        user.accountBalance -= amount
        await user.save();
        res.status(200).send(user)
    };

    //Transfer to another account
    const transfer = () => {

    }

    switch (transactionType) {
      case "DEPOSIT":
        deposit();
        break;
      case "WITHDRAW":
        withdraw();
        break;
      case "TRANSFER":
        transfer();
        break;
      default:
        res.status(400).send({ messsage: "invalid transaction type" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
