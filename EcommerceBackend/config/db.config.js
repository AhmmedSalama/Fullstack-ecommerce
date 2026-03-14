const mng = require("mongoose");

const connectDB = async () => {
  try {
    const con = await mng.connect(process.env.MONGO_URI);
    console.log(`Connected To Mongo DB host: ${con.connection.host}`);
  } catch (err) {
    console.log(`Mongo DB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
