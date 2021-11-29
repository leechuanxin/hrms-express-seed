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
      organisation_id: {
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

    await queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      organisation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      date_at: {
        type: Sequelize.DATE,
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

    await queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      is_selected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      organisation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      start_month_date: {
        type: Sequelize.DATE,
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

    await queryInterface.createTable('optimisations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'schedules',
          key: 'id',
        },
      },
      organisation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      date_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('optimisations');
    await queryInterface.dropTable('schedules');
    // drop events first, since it has foreign keys in users and orgs
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('organisations');
  },
};
