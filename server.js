import dotenv from 'dotenv';
import { connectDB } from './src/repositories/db.js';
import { app } from './src/app.js';


dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 3000;

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed", err)
})