const { Client } = require('pg');

const createTestDb = async () => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '123456789',
        database: 'postgres', // Connect to default db to create another
    });

    try {
        await client.connect();
        // Check if db exists
        const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'furniture_store_test'`);
        if (res.rowCount === 0) {
            console.log('Creating database furniture_store_test...');
            await client.query(`CREATE DATABASE furniture_store_test`);
            console.log('Database created.');
        } else {
            console.log('Database furniture_store_test already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
};

createTestDb();
