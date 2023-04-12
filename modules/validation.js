const validatorPackage = require("validator");



module.exports = {
  validateEmail: validatorPackage.isEmail
};
