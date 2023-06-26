import express from "express";
import hallRouter from "./routers/hallRouter.js"
import customerRouter from './routers/customerRouter.js'

const app = express();
app.use(express.json());

app.use("/halls", hallRouter);
app.use("/customers", customerRouter);

app.get('/', function (req, res) {
    res.send({msg: "Port running successfully in 5000"})
  })
  
  app.listen(3000)