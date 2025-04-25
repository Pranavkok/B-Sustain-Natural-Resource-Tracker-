import mongoose from "mongoose" ;
import dotenv from "dotenv" ;

dotenv.config()

if(!process.env.MONGO_URI){
    throw new Error(
        "Please provide MongoDb url in env file"
    )
}

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected DataBase")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default connectDb