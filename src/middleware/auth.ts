import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { pool } from "../db";

const auth = (...roles: any) => {
return async (
    req: Request, res: Response, next:NextFunction
) => {

    console.log(roles);
    
    //* 1->  Check if the token exist 

    // console.log(req.headers.authorization);
    const token = req.headers.authorization;

    if(!token) {
        res.status(401).json({
            success: false,
            massage: "Unauthorized access!!"
        })
    }

    //* 2-> Verify Token

    const decode = jwt.verify(token as string, config.jwt_secret) as JwtPayload
    // console.log(decode);

   //* 3-> Check if the user exists

    const user = await pool.query(`
        SELECT * FROM users
        WHERE email=$1`,
    [decode.email],
)

if(user.rowCount === 0) {
    res.status(404).json({
        success: false,
        message: "User not found!!"
    })
}

//* 4-> Is the user status Active

if(!user.rows[0].is_active){
    res.status(403).json({
        success: false,
        message: "Forbidden!!"
    })
}

// TODO: send 

req.user = decode;


next();
    
    
}
}

export default auth;