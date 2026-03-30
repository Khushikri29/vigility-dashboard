const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const FeatureClick = sequelize.define('FeatureClick', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  feature_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

User.hasMany(FeatureClick, { foreignKey: 'user_id' });
FeatureClick.belongsTo(User, { foreignKey: 'user_id' });

module.exports = FeatureClick;
