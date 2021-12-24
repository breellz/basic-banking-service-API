Documentation can be found here:
https://documenter.getpostman.com/view/11784799/UVREiitp

Features

Users can:
- Login
- Deposit money
- Withdraw money
- Transfer funds to other users
- See a list of their transactions
Admin can:
- Add users
- Delete users
- Reverse transactions(transfer)
- Disable a user’s account

Feature breakdown:


To use Admin priviledges, create an admin account and use the provided token. Also, to use user features,create account as a user and use the provided token

Every user has a createdby property which contains the Id of the admin that created the user

Once a user deposits money a transaction of type "DEPOSIT" is created for that user, same goes for withdrawal with appropriate type of transaction created.

when a user transfers funds, a transaction of type "TRANSFER" is created for them and the recepient, a transaction of type "CREDIT" is created.

Users can see a list of their transactions, be it deposit, withdrawal, transfer, credit or all of them.

Only administrators can create accounts for users 

Admins can delete user accounts(all their transactions are deleted also)

Admins can reverse a transaction and also disable a user's account