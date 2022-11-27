const mongoose = require('mongoose')
const UserModel = require('../models/user');
const WalletModel = require('../models/wallet')
const HelperFunctions = require('../utils/helper-functions');
const { successResponse, errorResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');
const Token = require('../utils/token');

/**
 * @description - This is a class that contains methods for user authentication and authorization.
 */

class UserService {
  /**
   * @description - This method is used to signup a user
   * @param {object} userData - The user data
   * @returns {object} - Returns an object
   * @memberof UserService
   */


  static async signup(data) {
    let session
    try {
      const { email, username, password } = data;
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      if (user)
        return {
          statusCode: 409,
          message: 'User already exists',
        };
      const hashedPassword = HelperFunctions.hashPassword(password);
      session = await mongoose.startSession();
      session.startTransaction();
      // const opts = { session };

      const newUser = await UserModel.create([{
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword
      }])
      const wallet = await WalletModel.create([{ userId: newUser.id }])
      await session.commitTransaction();
      session.endSession();
      logger.info(`User created with email: ${email}`);
      
      return {
        statusCode: 201,
        message: 'User created successfully',
        data: newUser
      };
    }
    catch (error) {
      await session.abortTransaction();
      session.endSession()
      throw error
    }
  }
  /**
   * @description - This method is used to login a user
   * @param {object} userData - The user data
   * @returns {object} - Returns an object
   * @memberof UserService
   
   */
  static async login(data) {
    const { email, password } = data;
    const user = await UserModel.findOne({ email });

    if (!user)
      return {
        statusCode: 404,
        message: 'User does not exist',
      };

    const isPasswordValid = HelperFunctions.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid)
      return {
        statusCode: 401,
        message: 'Invalid password',
      };

    const accessToken = Token.generateToken(user);
    logger.info(`User logged in with email: ${email}`);
    user.password = undefined;
    return {
      statusCode: 200,
      message: 'User logged in successfully',
      data: {
        user,
        accessToken,
      },
    };
  }
}
module.exports = UserService;

