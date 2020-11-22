const oauth = require('oauth');
const express = require("express");
const session = require('express-session')
const bodyParser = require('body-parser');
const moment = require('moment')
const cors = require('cors')
const Twitter = require('twitter');
const { ObjectID } = require('mongodb');
const {TRENDS_API_URL} = require("./constants")
const fetch = require("node-fetch");
const app = express();
app.use(cors({credentials: true, origin: true}));
app.options('*', cors());


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://daipayan:codechella1@cluster0.qrtrr.mongodb.net/Codechella?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
const dbName = "Codechella"
let cachedDb = null;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'codechella_32bits',
    resave: false,
    saveUninitialized: true,
    cookie: { }//sameSite:"none", secure:true}
  }))


const _twitterConsumerKey = "j4tlebxTDaYve8oNyPGCQRHJn";
const _twitterConsumerSecret = "p1J9sf9oYlxoM31Gf2M1Ub2YhgmxT16wNrb9SMBe9aCCeBszY7";

const consumer = () => {
    return new oauth.OAuth(
      'https://api.twitter.com/oauth/request_token', 
      'https://api.twitter.com/oauth/access_token', 
       _twitterConsumerKey, 
       _twitterConsumerSecret, 
       "1.0A", 
       'http://127.0.0.1:3000/callback', 
       "HMAC-SHA1"
     );
    }




//does not require you to pass in anything, will return the initial oauthtoken and oauthtokensecret
/**
 * Required query params :
 * None
 * 
 * Required body:
 * None
 */
app.get("/init" , (req,res) => {
    consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){ //callback with request token
        if (error) {
          res.send(JSON.stringify(error));
        } else {         
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            
            const data = {
                redirectUrl : "https://api.twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken,
                oauthToken : oauthToken,
                oauthTokenSecret: oauthTokenSecret
            }
            
            res.send(data);    
        }
      });
})

//Pass in the oauthtoken and oauthtokensecret and the oauthverifier(taken from the url in the callback) in the query params of the request
/**
 * Required query params :
 * oauth_token - > oauthToken received in last step
 * oauth_token_secret -> oauthTokenSecret received in last step 
 * oauth_verifier -> The verifier field taken from the url in the callback after authorization (After authorizing, the app will take you to an url which won't work
 * just copy the oauth_verifier field value from there)
 * 
 * Required body:
 * None
 */
app.get('/callback', (req, res) => {
    
    consumer().getOAuthAccessToken(
      req.session.oauthRequestToken || req.query.oauth_token, 
      req.session.oauthRequestTokenSecret || req.query.oauth_token_secret, 
      req.query.oauth_verifier, 

      //success callback
      (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) {
            console.log(JSON.stringify(error))
        } else {
            req.session.oauthAccessToken = oauthAccessToken;
            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
            
            consumer()
            .get("https://api.twitter.com/1.1/account/verify_credentials.json", 
                    req.session.oauthAccessToken, 
                    req.session.oauthAccessTokenSecret, 
                    (error, data, response) => {
                        if (error) {
                            console.log(JSON.stringify(error));
                            res.send("Oops!")
                        } else {
                            data = JSON.parse(data);
                            req.session.twitterScreenName = data.screen_name  
                            req.session.userId = data.userId
                            res.send({
                                data:data,
                                keys:{
                                    oauthAccessToken: oauthAccessToken,
                                    oauthAccessTokenSecret: oauthAccessTokenSecret
                                }
                            })
                        }  
                    });  
        }
    }
    );
});

//Pass in the oauthAccessToken and oauthAccessTokenSecret received in the last step in the form of query params
/**
 * Required query params :
 * oauth_token - > oauthAccessToken received in last step in the keys field
 * oauth_token_secret -> oauthAccessTokenSecret received in last step in the keys field
 * 
 * Required body:
 * The status to be posted
 */
app.post("/status" , async (req,res) => {
    const statusBody = req.body.status;
    if(!statusBody)
        res.send("Error!")

        var client = new Twitter({
            consumer_key: _twitterConsumerKey,
            consumer_secret: _twitterConsumerSecret,
            access_token_key: "1329163910436380672-fC6wJAWiGoRq6hx0bqw1j1KunwSZJL",
            access_token_secret: "zkdt849Z3Lub4EQcMU0FlkZL45JrA9NCsz0dXO19hGl8D"
          });
        try{
            const response = await postPromise(client,statusBody);
            res.send(response)

        }catch(err){
            console.log(err)
            res.end()
        }

});
const postPromise = (client,statusBody) => {
    return new Promise((resolve, reject) => {
      
        client.post('statuses/update', {status: statusBody},  function(error, tweet, response) {
            if(error) return reject(error);
            return resolve(response)
        });
    })
  }

//Pass in the oauthAccessToken and oauthAccessTokenSecret received in the last step in the form of query params
/**
 * Required query params :
 * oauth_token - > oauthAccessToken received in last step in the keys field
 * oauth_token_secret -> oauthAccessTokenSecret received in last step in the keys field
 * tweet_id -> id of the tweet for which metrics are to be calculated
 * 
 * Required body:
 * None
 */
app.get("/metrics" , (req,res) => {
    const tweet_id = req.query.tweet_id;
    consumer()
    .get(`https://api.twitter.com/2/tweets/${tweet_id}?tweet.fields=non_public_metrics,organic_metrics&media.fields=non_public_metrics,organic_metrics&expansions=attachments.media_keys`,
            req.session.oauthAccessToken || req.query.oauth_token, 
            req.session.oauthAccessTokenSecret || req.query.oauth_token_secret, 
            (error, data, _) => {
                if(error){
                    console.log(JSON.stringify(error))
                    res.send("oops")
                }else{
                    data = JSON.parse(data)
                    res.send(data)
                }
            }
    )
});

app.get("/", (req,res) => {
    res.send("Welcome!")
})


app.get("/trends", async (req,res) => {
    const oauthToken =  req.session.oauthAccessToken || req.query.oauth_token;
    const oauthTokenSecret = req.session.oauthAccessTokenSecret || req.query.oauth_token_secret;
    const screenName = req.session.twitterScreenName || req.query.screen_name;



    //call python code here
    
    const response = await fetch(`${TRENDS_API_URL}/?token=${oauthToken}&name=${screenName}&secret=${oauthTokenSecret}&type=Engagement`);
    const data =  await response.json();   

    res.send(data)
});

app.get("/emotion", async (req,res) => {
    const oauthToken =  req.session.oauthAccessToken || req.query.oauth_token;
    const oauthTokenSecret = req.session.oauthAccessTokenSecret || req.query.oauth_token_secret;
    const screenName = req.session.twitterScreenName || req.query.screen_name;
    const id = req.session.userId || req.query.userId

    const campaignText = req.query.text;

    //call python code here
    const response = await fetch(`${TRENDS_API_URL}/?token=${oauthToken}&text=${campaignText}&secret=${oauthTokenSecret}&type=sentiment_score`);
    const data = await response.json();


    res.send(data)
})

app.delete("/campaigns" , (req,res) => {
    if(cachedDb == null){
        MongoClient.connect(uri, function (err, client) {
            cachedDb = client.db('Codechella');
            cachedDb.collection('Schedules').deleteOne(
                { _id: ObjectID(req.query.id) },
            ).toArray(function(err, docs) {
                if(err != null)
                    res.send(err)
                res.send(docs);
            })
        });
    }else{
        cachedDb.collection('Schedules').deleteOne(
            { _id: ObjectID(req.query.id) },
        ).toArray(function(err, docs) {
            if(err != null)
                res.send(err)
            res.send(docs);
        })
    }
})
app.get("/campaigns", (req,res) => {
    const oauthToken =  req.session.oauthAccessToken || req.query.oauth_token;
    const oauthTokenSecret = req.session.oauthAccessTokenSecret || req.query.oauth_token_secret;
    const screenName = req.session.twitterScreenName || req.query.screen_name;

    if (cachedDb == null) {
        MongoClient.connect(uri, function (err, client) {
            cachedDb = client.db('Codechella');
            cachedDb.collection('Schedules').find(
                { active: { $eq: true } },
            ).toArray(function(err, docs) {
                if(err != null)
                    res.send(err)
                res.send(docs);
            })
        });
    }else{
        cachedDb.collection('Schedules').find(
            { active: { $eq: true } },
        ).toArray(function(err, docs) {
            if(err != null)
                res.send(err)
            res.send(docs);
        })
    }
})
app.post("/schedule", async (req,res) => {

    let userData = {};
    consumer()
    .get("https://api.twitter.com/1.1/account/verify_credentials.json", 
            req.session.oauthAccessToken, 
            req.session.oauthAccessTokenSecret, 
            async (error, data, response) => {
                if (error) {
                    console.log(JSON.stringify(error));
                    res.send("Oops!")
                } else {
                    data = JSON.parse(data);
                    req.session.twitterScreenName = data.screen_name  
                    
                    userData = data;
                    const dataItem = {
                        dates : req.body.dates.map(date => moment(date).utc().valueOf()),
                        type : req.body.type,
                        screenName: data.screen_name,
                        id: data.id_str,
                        name: data.name,
                        tweet: req.body.tweet,
                        campaignName: req.body.campaignName,
                        active: true,
                        oauthAccessToken: req.session.oauthAccessToken,
                        oauthAccessTokenSecret: req.session.oauthAccessTokenSecret,
                        startsAt: req.body.dates[0],
                        endsAt: req.body.dates[req.body.dates.length - 1]
                    }                

                    const collectionName = "Schedules";
                    if (cachedDb == null) {
                        console.log("No Cached connection...")
                        MongoClient.connect(uri, function (err, client) {
                            cachedDb = client.db('Codechella');
                            cachedDb.collection('Schedules').insertOne(
                                dataItem,
                                (err,result) => {
                                    res.send(result)
                                }
                            );

                        });
                    }else{
                        console.log("Found cached connecttion...")
                        cachedDb.collection('Schedules').insertOne(
                            dataItem,
                            (err,result) => {
                                res.send(result)
                            }
                        )
                    }
                }
            });      
})


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`App listening at ${port}`)
  })
