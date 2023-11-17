if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const https = require('https');
const fs = require('fs')
const cors = require('cors')
const mysql = require('mysql')
const socketIO = require('socket.io');
const bodyParser= require('body-parser')
const app = express();
app.use(cors({origin: '*'}));
app.use(bodyParser.json())
const GNRequest = require('./apis/efi')
app.set('view engine', 'ejs');
app.set('views', 'src/views')

const loginSQL= require('./mysql/login')
const conn = mysql.createConnection(loginSQL)


/* var sslrootcas = require('ssl-root-cas/latest')
sslrootcas.inject() */
const reqGNAlready = GNRequest({
  clientID : process.env.GN_CLIENT_ID,
  clientSecret : process.env.GN_CLIENT_SECRET
});

conn.connect((err)=>{
if(err) throw err;
console.log('conectado ao banco')
})



const credentials = require('./credentials/cred');
const httpsServer = https.createServer(credentials, app);
const corsOptions = {

origin: '*', // client (todo mundo pode acessar)

optionsSuccessStatus: 200
}
let statusMsg =0

app.get('/', async (req, res)=>{

  const reqGN = await reqGNAlready
     
  
      const dataCob = {
        
              calendario: {
                expiracao: 3600
              },
              devedor:{
                cpf : '30907121802',
                nome: 'fernanda nogueira'
              },
             
              valor: {
                "original": "0.01"
              },
              chave: "46f4e12c-d1e8-4c39-8da1-669fdb599a38",
              solicitacaoPagador: "Cobrança dos serviços prestados."
            
             
            
      }
    
     const cobResponse=  await reqGN.post('/v2/cob', dataCob)

     const txdId = cobResponse.data.txid
     console.log(cobResponse)
    console.log('txId',txdId)
      const qrcodeResponse = await reqGN.get(`v2/loc/${cobResponse.data.loc.id}/qrcode`)
     /* res.send(qrcodeResponse.data)  */
     if(statusMsg===0){

       res.render('qrcode',{qrcodeImage: qrcodeResponse.data.imagemQrcode, resposta: 'teste', success:false}) 
     }
     else{
      res.render('qrcode',{qrcodeImage: qrcodeResponse.data.imagemQrcode, resposta: 'teste2', success:false}) 
     }
    
     let data ={ txId : txdId, cpf : dataCob.devedor.cpf, nome : dataCob.devedor.nome, valor: dataCob.valor.original, status: cobResponse.data.status}
     let sqlQuery = "INSERT INTO pagamentos SET ?";
     let query = conn.query(sqlQuery, data,(err,results)=>{
     
     })
   
  })

 
   app.get('/cobrancas', async (req,res)=>{
      const reqGN = await reqGNAlready
      const cobResponse = await reqGN.get('/v2/cob?inicio=2023-11-12T16:01:35Z&fim=2023-11-14T20:10:00Z')
      res.send(cobResponse.data)
   })

   app.post('/webhook/', (req,res)=>{
    console.log(req.body)
    res.status(200).end();
   })

   
   app.post('/webhook/pix/', (req,res)=>{
  
    const status = "pago"
    statusMsg=1;
   const txId= req.body.pix[0].txid
    console.log(req.body.pix[0].txid)
    
 /*    let sqlQuery = "UPDATE pagamentos SET status='"+status+"' WHERE txId="+req.body.pix[0].txid; */
    let sqlQuery = "UPDATE pagamentos SET status='"+status+"' WHERE txId='"+txId+"'";
    // gravar no banco de dados essa informação"
    let query = conn.query(sqlQuery, (err, results)=>{
      if(err) throw err;
     /*  res.render('qrcode',{qrcodeImage: "", resposta: 'foi', success: true})  */
    
      /* res.render('sucesso',{sucess:true, resposta:'foi'}) */
      res.redirect('/')
      console.log('foi2')
  
    
      
    })
  
    /* res.status(200).end(); */
 })

/* app.listen(21226, ()=>{
  console.log('running')
}) */

httpsServer.listen(21226, () => {
console.log('HTTPS Server running on port 21226');
});








