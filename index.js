const express = require("express");
const morgan = require('morgan');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const  rateLimit =  require('express-rate-limit');
const app = express();

const PORT = 3005;
const exampleProxy = createProxyMiddleware({
    target: 'http://localhost:3002/bookingservice', // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
  });

const limiter = rateLimit(
    {
        windowMs : 2*60*1000,
        max : 5
    }
)


app.use(morgan('combined'));  
app.use(limiter);

app.use('/bookingservice', async(req,res,next)=>{
    try{
      const response = await axios.get('http://localhost:3000/api/v1/isAuth',
      {
        headers:{
            'x-access-token' : req.headers['x-access-token']
        }
      }
    );
      if(response.data.success){
        next();
      }
      else{
        return res.status(401).json(
            {
                message : "UnAuthorized"
            }
        )
      }
    }
    catch(error){
       return res.status(401).json(
        {
            message : "Unauthorized"
        }
       )
    }
})
app.use('/bookingservice', exampleProxy);

app.get('/home',(req,res)=>{
    return res.json({message : 'OK'})
})

app.listen(PORT,()=>{
    console.log(`Server Started At ${PORT}`)
})