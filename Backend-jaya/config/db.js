import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const data = await mongoose.connect(process.env.DB_URL);

    console.log("db connected in your", data.connection.host);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     const data = await mongoose.connect(process.env.DB_URL);

//     console.log("MongoDB Host:", data.connection.host);
//     console.log("MongoDB Database:", data.connection.name);

//     const productCount = await data.connection.db
//       .collection("products")
//       .countDocuments();

//     console.log("Products in database:", productCount);
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//     process.exit(1);
//   }
// };
