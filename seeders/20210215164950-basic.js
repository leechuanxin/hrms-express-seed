const jssha = require('jssha');

const { SALT } = process.env;

function getHash(input) {
  // eslint-disable-next-line new-cap
  const shaObj = new jssha('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhasedString = `${input}-${SALT}`;
  shaObj.update(unhasedString);

  return shaObj.getHash('HEX');
}

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('organisations', [
      {
        name: 'Rocket Industries',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        real_name: 'Neo Kai Yuan',
        password: getHash('testuser123'),
        org_id: 1,
        role: 'admin',
        wage: 10000.00,
        remaining_leaves: 0,
        remaining_shifts: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'chee_kean',
        real_name: 'Chee Kean',
        password: getHash('testuser123'),
        org_id: 1,
        role: 'worker',
        wage: 1500.00,
        remaining_leaves: 3,
        remaining_shifts: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'chuan_xin',
        real_name: 'Chuan Xin',
        password: getHash('testuser123'),
        org_id: 1,
        role: 'worker',
        wage: 1500.00,
        remaining_leaves: 3,
        remaining_shifts: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  // to create default world json here
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('organisations', null, {});
  },
};
