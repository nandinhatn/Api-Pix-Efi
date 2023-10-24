/* const https = require("https");
const axios = require("axios");
const fs = require("fs");


const credenciais = {
    client_id:  "Client_Id_112eed0e91aa1f49e2e18525c0cbb5b937c6fbbb",
    client_secret:"Client_Secret_a8dcaa2d8680e4f4f40cac718890978680f7d634"
};

const data = JSON.stringify({grant_type: "client_credentials"});

const data_credentials = credenciais.client_id + ":" + credenciais.client_secret

var auth = Buffer.from(data_credentials).toString("base64");

//Consumo em desenvolvimento da rota post oauth/token
var config = {
    method: "POST",
    url: "	https://cobrancas-h.api.efipay.com.br/v1/authorize",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/json",
    },
    data: data,
  };
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });

  const hostname = '127.0.0.1';
const port = 3000;
 
const server = https.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});
 
server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
}); */