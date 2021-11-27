import * as validation from '../validation.mjs';
import * as util from '../utils.mjs';
import * as globals from '../globals.mjs';

export default function initSignupController(db) {
  const create = async (request, response) => {
    const userInfo = request.body;
    const validatedUserInfo = validation.validateUserInfo(userInfo);
    const invalidRequests = util.getInvalidFormRequests(validatedUserInfo);
    try {
      if (invalidRequests.length > 0) {
        throw new Error(globals.INVALID_REGISTER_REQUEST_MESSAGE);
      }
      // get the hashed password as output from the SHA object
      const hashedPassword = util.getHash(validatedUserInfo.password1);
      const nameFmt = validatedUserInfo.realName.trim().replace(/\s+/g, ' ');
      const { username } = validatedUserInfo;
      const user = await db.User.findOne({
        where: {
          username,
        },
      });

      if (user) {
        throw new Error(globals.USERNAME_EXISTS_ERROR_MESSAGE);
      }
      const newUser = await db.User.create({
        username,
        realName: nameFmt,
        password: hashedPassword,
        organisationId: 1,
        role: 'worker',
        wage: 1500.00,
        remainingLeaves: 3,
        remainingShifts: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const successMessage = 'You have registered successfully! Please log in.';
      response.send({
        id: newUser.id,
        message: successMessage,
        username: newUser.username,
        realName: newUser.realName,
      });
    } catch (error) {
      let errorMessage = '';
      if (
        error.message === globals.USERNAME_EXISTS_ERROR_MESSAGE
      ) {
        errorMessage = 'There has been an error. Please try registering again with a proper username, name, description, or password.';
      } else if (error.message === globals.INVALID_REGISTER_REQUEST_MESSAGE) {
        errorMessage = 'There has been an error. Registration input validation failed!';
      } else {
        errorMessage = error.message;
      }

      const resObj = {
        error: errorMessage,
        message: errorMessage,
        ...validatedUserInfo,
      };
      delete resObj.password;
      response.send(resObj);
    }
  };

  return {
    create,
  };
}
