import { expect } from 'chai';
import * as validation from '../validation.mjs';

describe('HRMS Backend', () => {
  describe('Validation', () => {
    it('Disallows empty passwords', () => {
      const passwordValidationObj = validation.validatePassword(
        { password: '' },
        'login',
      );

      expect(passwordValidationObj.password_invalid).to.equal('Please type in your password.');
    });
  });
});
