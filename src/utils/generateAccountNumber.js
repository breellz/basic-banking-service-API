const generateAccountNumber = () => {
    return Math.floor(100000000 + Math.random() * 1000000000)
}

module.exports = generateAccountNumber