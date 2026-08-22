import dotenv from "dotenv";
import app from "./app.js";
import { PORT } from "./config/config.js";



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});