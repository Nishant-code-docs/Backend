import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is listing at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO DB CONNECTION FAILED", error);
  });




























  
// const app =express();
// (async()=> {
// try {

//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//         console.error('error');
//         throw new Error("Error");

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listing on Port:${process.env.PORT}`);

//         })
//     } )
// } catch (error) {
//     console.error('ERROR: ',error);
//     throw new Error("Error");

// }
// })()
