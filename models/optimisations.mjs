export default function initOptimisationsModel(sequelize, DataTypes) {
  return sequelize.define(
    'optimisation',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      scheduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'schedules',
          key: 'id',
        },
      },
      organisationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      dateAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    },
  );
}
