import mongoose from 'mongoose';

// Cache the connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function mongooseConnect() {
    // Get the environment variable inside the function to ensure it's available
    const MONGODB_URI = process.env.MONGODB_URI;

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!MONGODB_URI) {
            throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }

        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
            console.log('MongoDB connected successfully!');
            return m;
        }).catch((err) => {
            console.error('MongoDB connection error:', err);
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export { mongooseConnect };
