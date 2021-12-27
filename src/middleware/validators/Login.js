const { body, validationResult } = require('express-validator')
const validationRules = () => {
  return [
    // username must be an email
    body('email').isEmail().withMessage('Email is invalid'),
    // password must be at least 5 chars long
    body('password').isLength({ min: 7 }).withMessage('Password must be at least 7 chars long'),
  ]
}


const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  validationRules,
  validate,
}