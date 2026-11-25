import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
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
            expiresIn: "1d"
        }
    )

    delete user.rows[0].password;
    return {accessToken, user: user.rows[0]};
}


export const authService = {
    loginUserIntoDB
}