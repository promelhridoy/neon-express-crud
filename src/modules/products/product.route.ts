import { Router } from "express";
import { productController } from "./product.controller";
import auth from "../../middleware/auth";

const route = Router();

route.post("/", auth("admin") , productController.productCreate)
route.get("/", productController.getAllProduct)
export const productRoute = route;