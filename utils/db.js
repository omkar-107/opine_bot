const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

async function connectToDatabase() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB🥳🥂🎀');
    } catch (err) {
        console.error('Failed to connect to MongoDB🤦‍♂️', err);
        process.exit(1); 
    }
}

export default connectToDatabase;
