export default function initScheduleModel(sequelize, DataTypes) {
  return sequelize.define(
    'schedule',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      isSelected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      organisationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'organisations',
          key: 'id',
        },
      },
      startMonthDate: {
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
