import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import Routes from "./routes/index";

const PORT = process.env.PORT;

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api", Routes);

app.get("/", (req, res) => {
    res.send("Hello From Doodle's API !")
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
