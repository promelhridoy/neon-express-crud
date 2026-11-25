import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: 
    {email: string; password: string}
) => {
    //* Check if the user exist -> Done
    //* check if the password match -> Done
    //* check the user status ->
    //* If pass all then generate jwt token -> 
    
    const {email, password} = payload;

    const user = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,
        [email],
    )
    
    const matchPassword = await bcrypt.compare(password, user.rows[0].password)

    if(!matchPassword) {
        throw new Error("Invalid credentials!!")
    }

    if(!user.rows[0].is_active) {
        throw new Error("Access denied!!");
    }

    const jwtPayload = {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
    }

    const accessToken = jwt.sign(jwtPayload,
        config.jwt_secret, {
            expiresIn: "1h"
        }
    )

    const refreshToken = jwt.sign(jwtPayload,
        config.refresh_secret, {
            expiresIn: "10d",
        }
    )

    delete user.rows[0].password;
    return {accessToken, refreshToken,user: user.rows[0]};
}


const generateAccessToken = async(token: string) => {
       //* 1->  Check if the token exist 

    if(!token) {
      throw new Error("Unauthorized access!!")
    }

    //* 2-> Verify Token

    const decode = jwt.verify(
        token as string, 
        config.jwt_secret
    ) as JwtPayload
    // console.log(decode);

   //* 3-> Check if the user exists

    const user = await pool.query(`
        SELECT * FROM users
        WHERE email=$1`,
    [decode.email],
)

if(user.rowCount === 0) {
    throw new Error("User not found!!")
    
}

//* 4-> Is the user status Active

if(!user.rows[0].is_active){
   throw new Error("Forbidden!!")
}


const jwtPayload = {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
    }

    const accessToken = jwt.sign(jwtPayload,
        config.jwt_secret, {
            expiresIn: "1h"
        }
    )

    return {accessToken}

}


export const authService = {
    loginUserIntoDB,
    generateAccessToken
}