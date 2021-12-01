import { expect } from 'chai';
import * as validation from '../validation.mjs';

describe('HRMS Backend', () => {
  describe('Validation', () => {
    it('Checks for an empty password field on login', () => {
      const passwordValidationObj = validation.validatePassword(
        { password: '' },
        'login',
      );

      expect(passwordValidationObj.password_invalid).to.equal('Please type in your password.');
    });
  });
});
