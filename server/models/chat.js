import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Chat = sequelize.define('chat_table', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   sender: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   reciever: {
      type: Sequelize.INTEGER,
      allowNull: false,
   },
   message: {
      type: Sequelize.TEXT('long'),
      allowNull: false,
   },
   video_message: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   audio_message: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
   image_message: {
      type: Sequelize.INTEGER,
      allowNull: true,
   },
});

export default Chat;
