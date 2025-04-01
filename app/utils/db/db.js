import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if(!MONGODB_URL){
    throw new Error("MONGODB_URL is missing in .env");
}

let isConnected = false; //Track the connection status

export const connectToDB = async () => {
    if(isConnected){
        console.log("Already connected to mongodb database");
        return;
    }

    try {
        const db = mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = (await db).connections[0].readyState;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}