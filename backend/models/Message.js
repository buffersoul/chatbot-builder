'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    conversation_id: DataTypes.UUID,
    message_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document'),
      defaultValue: 'text'
    },
    rag_context_used: DataTypes.JSONB,
    api_data_used: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: true
  });
  return Message;
};