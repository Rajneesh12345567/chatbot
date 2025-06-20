import validator from 'validator'

const validateUserInput = (userInput) => {
  const mandatoryFields = ["firstName", "emailId", "password"];

  for (const field of mandatoryFields) {
    if (!userInput[field]) {
      throw new Error(`Missing field: ${field}`);
    }
  }

  if (!validator.isEmail(userInput.emailId)) {
    throw new Error("Invalid Email!");
  }

  if (
    !validator.isStrongPassword(userInput.password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    throw new Error("Password is not strong enough!");
  }
};

export default validateUserInput;
