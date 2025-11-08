import express from "express";
import cors from "cors";
import { createServer } from "http";
import lobbiesRouter from "./routes/lobbiesRouter";
import Eventrouter from "./routes/eventsRouter";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", lobbiesRouter);
app.use("/api/events",Eventrouter)
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5300;
const HOST = "0.0.0.0"; // 👈 this exposes your server to your entire local network
httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Server running at:`);
});
