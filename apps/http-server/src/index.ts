import "dotenv/config";
import express, { Application, json } from "express";
import cors, { CorsOptions } from "cors";
import Routes from "./routes/index";

const PORT = process.env.PORT;

const app: Application = express();

const allowList = ['https://www.doodle.codes', 'https://doodle-web-black.vercel.app']

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowList.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    optionsSuccessStatus: 200
}

app.use(json());

app.use("/api/v1", cors(corsOptions), Routes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.send("Hello From Doodle's API !")
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
