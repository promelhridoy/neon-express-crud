import type { Request, Response } from "express";
import { productService } from "./product.service";

const productCreate =  async (req : Request, res: Response
) => {
    try {
        console.log("Product Create Controller:", req);
        
    const user_id = req.user?.id;

    const payload = { ...req.body, user_id };

    const result = await productService.createProductIntoDB(payload);        

     res.status(201).json({
      success: true,
      message: "Product created successfully!!",
      data: result
      
    });
    } catch (error: any) {
         res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
    }
}

const getAllProduct = async (req: Request, res: Response) => {
  try {
    const result = await productService.getAllProductFromDB(req.query);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully!!",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message,
      error,
    });
  }
};


export const productController = {
    productCreate,
    getAllProduct,
}