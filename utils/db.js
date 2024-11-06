const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB 😊');
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB🥳🥂🎀');
    } catch (err) {
        console.error('Failed to connect to MongoDB🤦‍♂️', err);
        process.exit(1);
    }
}

export default connectToDatabase;
