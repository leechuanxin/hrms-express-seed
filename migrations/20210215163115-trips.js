module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organisations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      real_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      role: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      wage: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: false,
      },
      remaining_leaves: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remaining_shifts: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('organisations');
  },
};
