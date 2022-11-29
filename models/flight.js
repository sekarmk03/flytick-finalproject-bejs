'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Flight.init({
    code: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    current_airport: DataTypes.INTEGER,
    is_ready: DataTypes.BOOLEAN,
    is_maintain: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};