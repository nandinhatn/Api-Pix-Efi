if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const axios  = require('axios')
const fs = require('fs')
const path = require('path')
const https= require('https')
const cert = fs.readFileSync(
    path.resolve(__dirname, `../certs/${process.env.GN_CERT}`)
)
const agent = new https.Agent({
    pfx: cert,
    passphrase:''
})

const credentials = Buffer.from(
    `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString('base64');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'src/views')

app.get('/', async (req, res)=>{
  const authResponse = await   axios({
        method:'POST',
        url: `${process.env.GN_ENDPOINT}/oauth/token`,
        headers: {
            Authorization : `Basic ${credentials}`,
            'Content-Type': "application/json"
    
        },
        httpsAgent : agent,
        data : {
            grant_type: 'client_credentials'
        }
    })
    

       
      const accessToken = authResponse.data?.access_token;
        console.log('+++++++++++++++++++++++++++++++',accessToken)
        const endpoint =`https://pix-h.api.efipay.com.br`
        const dataCob = {
          
                calendario: {
                  expiracao: 3600
                },
               
                valor: {
                  "original": "123.45"
                },
                chave: "46f4e12c-d1e8-4c39-8da1-669fdb599a38",
                solicitacaoPagador: "Cobrança dos serviços prestados."
              
               
              
        }
        const reqGN = axios.create({
            baseURL : endpoint,
           
            headers:{
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent,
        })
       
       const cobResponse=  await reqGN.post('/v2/cob', dataCob)
      
        const qrcodeResponse = await reqGN.get(`v2/loc/${cobResponse.data.loc.id}/qrcode`)
       /* res.send(qrcodeResponse.data)  */
       res.render('qrcode',{qrcodeImage: qrcodeResponse.data.imagemQrcode}) 
    })


app.listen(8000, ()=>{
    console.log('running')
})





