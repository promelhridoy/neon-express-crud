import type { RequestHandler } from "express";
import fs from "fs";

const logger: RequestHandler = async (req, res, next) => {


    const log = `\nMethod : ${req.method} | URL : ${req.url} | Time : ${Date.now()}\n`;

    fs.appendFile("logger.txt", log, (err: any) => {
        console.log(err);
        
    })

    next();
}

export default logger;