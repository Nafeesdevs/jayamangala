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
