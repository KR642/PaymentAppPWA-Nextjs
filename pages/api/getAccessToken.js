const request = require('request');

const options = {
  url: 'https://sandbox-oba-auth.revolut.com/token',
  method: 'POST',
  cert: 'transport.pem',
  key: 'private.key',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: {
    grant_type: 'client_credentials',
    scope: 'accounts',
    client_id: 'cfd893f5-6f56-40a3-a1ac-c18fc608d3b9',
  },
};


request(options, (err, response, body) => {
  if (err) {
    console.error(err);
  } else {
    console.log(body);
  }
});


