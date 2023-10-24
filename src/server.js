if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')

const bodyParser= require('body-parser')
const app = express();
app.use(bodyParser.json())
const GNRequest = require('./apis/efi')
app.set('view engine', 'ejs');
app.set('views', 'src/views')

const reqGNAlready = GNRequest({
    clientID : process.env.GN_CLIENT_ID,
    clientSecret : process.env.GN_CLIENT_SECRET
});
app.get('/', async (req, res)=>{

    const reqGN = await reqGNAlready
       
    
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
      
       const cobResponse=  await reqGN.post('/v2/cob', dataCob)
      
        const qrcodeResponse = await reqGN.get(`v2/loc/${cobResponse.data.loc.id}/qrcode`)
       /* res.send(qrcodeResponse.data)  */
       res.render('qrcode',{qrcodeImage: qrcodeResponse.data.imagemQrcode}) 
    })

   
     app.get('/cobrancas', async (req,res)=>{
        const reqGN = await reqGNAlready
        const cobResponse = await reqGN.get('/v2/cob?inicio=2023-10-22T16:01:35Z&fim=2023-10-24T20:10:00Z')
        res.send(cobResponse.data)
     })

     app.post('/webhook(/pix)?', (req,res)=>{
        console.log(req.body);
        res.send('200')
     })

app.listen(8000, ()=>{
    console.log('running')
})





