import express, { type Application, type Request, type Response } from "express";
import config from "./config";

const app: Application = express();

app.get("/", (req : Request, res: Response) => {
//   res.send("Hello World!");


res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PHH",
})
});

app.listen(config.port, () => {
    console.log(`The Express server is running on the port ${config.port}`);
})

