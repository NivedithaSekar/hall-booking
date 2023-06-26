import express from "express";
import hallRouter from "./routers/hallRouter.js"
import customerRouter from './routers/customerRouter.js'

const app = express();
app.use(express.json());

app.use("/halls", hallRouter);
app.use("/customers", customerRouter);

app.get('/', function (req, res) {
    res.send('<h4>Postman Pusblished Doc: <a href="https://documenter.getpostman.com/view/20660257/2s93z87Ntw" target="_blank">https://documenter.getpostman.com/view/20660257/2s93z87Ntw</a></h4>')
  })
  
  app.listen(3000)