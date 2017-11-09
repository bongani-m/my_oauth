const express = require('express'),
      bodyParser = require('body-parser'),
      uuid = require('uuid/v1');
const app = express(),
      jsonParser = bodyParser.json();

const db = {
    apps: [{
        "name": "client app",
        "clientId": "CLIENT_ID",
        "clientSecret": "CLIENT_SECRET"
    }],
    accessTokens: [
        "ACCESS_TOKEN"
    ],
    refreshTokens: [],
    grantType: ['client_creditals'],
    sessionIds: []
};

// Hello World to check if app is working
app.get('/', (req, res) => {
    res.json({
        message: "Hello, World"
    })
});

// locking down for clients that would be using OAuth password grant
app.all('/local/*', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    const session_id = uuid();
    db.sessionIds.push(session_id);
    res.cookie('sessionid', session_id, { httpOnly: true });
    next();
});

// TODO: OAUTH password grand

// placehoder 
app.get('/local/api', (req, res) => {
   res.json({message: "Hello, World"});
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  });   

// auth middleware
function auth(req, res, next) {
    const token = db.accessTokens.find( token => token == req.get('Authorization').split(" ")[1]);
    if(token) {
        next()
    } else {
        res.status(401).json({
            message: 'Not Authorized'
        });
    }
}

// test route 
app.get( '/api/v1/hello', auth, (req, res) => {
    res.json({
        message: "Hello, Api"
    })
})




// get token
app.post('/token', (req, res) => {
    const client_id = req.query.client_id;
    const client_secret = req.query.client_secret;
    console.log({client_id, client_secret});
    const app = db.apps.find( app => {
        return app.clientId == client_id && app.clientSecret == client_secret; 
    });
    if(app) {
        const access_token = uuid(),
              refresh_token = uuid();
        db.accessTokens.push(access_token);
        db.refreshTokens.push(refresh_token);
        res.json({
            access_token,
            refresh_token,
            token_type: "Bearer",
            expires_in: 3600
        });
    } else {
        res.status(401).json({
            message: 'Not Authorized'
        });
    }
});

// register application
app.post('/register', jsonParser, (req, res) => {
    const name = req.body.name,
          clientId = uuid(),
          clientSecret = uuid();
    const app = {name, clientId, clientSecret};
    db.apps.push(app);
    res.json(app);
});

// dump for db data
app.get('/db', (req, res) => {
    res.json(db);
});

app.listen(8080, () => {
    console.log('app has started...');
    console.log('http://localhost:8080');
})