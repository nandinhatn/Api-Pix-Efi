if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const https = require('https');
const fs = require('fs')
const cors = require('cors')
const mysql = require('mysql')
/* const socketIO = require('socket.io'); */
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

const corsOptions = {

  origin: 'https://www.pix.poppytecnologias.com.br', // client (todo mundo pode acessar),
  methods:["GET", "POST"],
  
  optionsSuccessStatus: 200
}

const credentials = require('./credentials/cred');
const httpsServer = https.createServer(credentials, app);
/* var io = require('socket.io')(httpsServer); */

let statusMsg =0

/* io.on('connection', function(socket) {
  console.log('connected socket!');
  socket.emit('qr', qrcodeResponse.data.imagemQrcode);
  socket.emit('message', 'QR Code received, scan please!');
  socket.on('greet', function(data) {
    console.log(data);
    socket.emit('respond', { hello: 'Hey, Mr.Client!' });
  });
  socket.on('disconnect', function() {
    console.log('Socket disconnected');
  });
});  */

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
      
    
      
     const qrcodeResponse = await reqGN.get(`v2/loc/${cobResponse.data.loc.id}/qrcode`) 
     const copy = qrcodeResponse.data.qrcode
        /* const teste =await reqGN.get(`v2/loc/${cobResponse.data.loc.id}`) */
        console.log("***************************************")
        console.log(copy)
        console.log("***************************************")
        
         res.render('qrcode',{qrcodeImage: qrcodeResponse.data.imagemQrcode, copy: copy, resposta: 'Aguardando Pagamento', success:false, texto:txdId, cpf : dataCob.devedor.cpf, nome : dataCob.devedor.nome, valor: dataCob.valor.original,  }) 
      
   /*     res.sendFile('index.html', { root: __dirname }); */
    
      
        
       let data ={ txId : txdId, cpf : dataCob.devedor.cpf, nome : dataCob.devedor.nome, valor: dataCob.valor.original, status: cobResponse.data.status}
       let sqlQuery = "INSERT INTO pagamentos SET ?";
       let query = conn.query(sqlQuery, data,(err,results)=>{
       
       })
     
    })

    app.get("/webhook/sucesss", (req,res)=>{
      res.redirect(res.get('sucesso'))
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
  
      app.get('/checkPag/:id', async (req,res)=>{

        let txid = req.params.id
        const reqGN = await reqGNAlready
        const cobResponse = await reqGN.get(`/v2/cob/${txid}`)
         res.send(cobResponse.data)
       /*  let sqlQuery = "SELECT * FROM pagamentos WHERE txId='"+req.params.id+"'" ;

        let query = conn.query(sqlQuery, (err, results)=>{
          if(err) throw err;
          res.send(results)
        }) */
        
      })
     
     app.post('/webhook/pix/', (req,res)=>{
    
      const status = "PAGO"
      statusMsg=1;
     const txIdResponse= req.body.pix[0].txid
      console.log(req.body.pix[0].txid)
      
      
   /*    let sqlQuery = "UPDATE pagamentos SET status='"+status+"' WHERE txId="+req.body.pix[0].txid; */
      let sqlQuery = "UPDATE pagamentos SET status='"+status+"' WHERE txId='"+txIdResponse+"'";
      // gravar no banco de dados essa informação"
      let query = conn.query(sqlQuery, (err, results)=>{
        if(err) throw err;
       /*  res.render('qrcode',{qrcodeImage: "", resposta: 'foi', success: true})  */
      
        /* res.render('sucesso',{sucess:true, resposta:'foi'}) */
        /* res.render('qrcode',{qrcodeImage: "", resposta: 'foi',  texto:'teste',success: true}) */
        console.log('foi2')
        res.send(200)
    
      
        
      })
    
      /* res.status(200).end(); */
   })

/* app.listen(21226, ()=>{
    console.log('running')
}) */

httpsServer.listen(21226, () => {
	console.log('HTTPS Server running on port 21226');
});








