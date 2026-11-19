import type { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req : Request, res: Response) => {
    try {

        const result = await userService.createUserIntoDB(req.body)
        // console.log("result :",result);

        
         res.status(201).json({
      success: true,
      message: "User created successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}


const getAllUser = async (req : Request, res: Response) => {
    try {
        
        

            // console.log(result.rows[0]);
            const result = await userService.getAllUserFromDB()
            


         res.status(200).json({
      success: true,
      message: "User retrived successfully!!",
      data: result.rows
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}

const getSingleUser = async (req : Request, res: Response) => {
    try {

        const { id } =req.params;
        
        const result = await userService.getSingleUSerFromDB(id as string)

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User retrived successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}

const updateUser = async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        const result = await userService.updateUserFromDB(req.body, id as string)

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User Updated Successfully!!",
      data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}

const deleteUser = async (req : Request, res: Response) => {
    try {

        const { id } =req.params;

        const result = await userService.deleteUserFromDB(id as string)
        

            // console.log(result.rows[0]);
            
            if(result.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
                });
            }


         res.status(200).json({
      success: true,
      message: "User Deleted Successfully!!",
    //   data: result.rows[0]
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}

export const userController = {
    createUser,
    getAllUser,
    getSingleUser,
    updateUser,
    deleteUser,
}