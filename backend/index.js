import "dotenv/config";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
