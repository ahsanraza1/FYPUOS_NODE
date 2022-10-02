import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('fypuos', 'root', 'rootpass', {
    dialect: 'mysql',
    host: 'localhost', 
});

export default sequelize;