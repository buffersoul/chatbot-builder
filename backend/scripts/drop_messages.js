const { sequelize } = require('../models');

async function dropMessages() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.query('DROP TABLE IF EXISTS messages CASCADE');
        console.log('Dropped messages table.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropMessages();
