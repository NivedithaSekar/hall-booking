import express from "express";
const customerRouter = express.Router();
import { customers } from '../data.js'


customerRouter.get("/get", async (req, res) => {
      //console.log(halls, bookings);
      res.send({ customers, msg: "All Customer Details successfully retrieved" });
  
});



export default customerRouter;
