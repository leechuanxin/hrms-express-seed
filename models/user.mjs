export default function initUserModel(sequelize, DataTypes) {
  return sequelize.define(
    'user',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      realName: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        is: /^[0-9a-f]{64}$/i,
      },
      organisationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      wage: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
      },
      remainingLeaves: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      remainingShifts: {
        type: DataTypes.INTEGER,
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
