module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    role: DataTypes.STRING,
    status: DataTypes.STRING,
    settings: DataTypes.JSON,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {
    tableName: 'users',
    timestamps: false
  });
};