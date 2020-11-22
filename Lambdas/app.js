'use strict'

var MongoClient = require('mongodb').MongoClient;
var moment = require("moment");
const fetch = require("node-fetch");

let atlas_connection_uri;
let cachedDb = null;

exports.handler = (event, context, callback) => {
    const uri = "mongodb+srv://daipayan:codechella1@cluster0.qrtrr.mongodb.net/Codechella?retryWrites=true&w=majority";


    if (atlas_connection_uri != null) {
        processEvent(event, context, callback);
    } 
    else {
        atlas_connection_uri = uri;
        processEvent(event, context, callback);
    } 
};

function processEvent(event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        if (cachedDb == null) {
            MongoClient.connect(atlas_connection_uri, function (err, client) {
                cachedDb = client.db('Codechella');
                return createDoc(cachedDb, null, callback);
            });
        }
        else {
            createDoc(cachedDb, jsonContents, callback);
        }
    }
    catch (err) {
        console.error('an error occurred', err);
    }

}

function createDoc (db, json, callback) {

    db.collection('Schedules').find(
        { active: { $eq: true } },
    ).toArray(function(err, docs) {

        if(err!=null) {
                console.error("an error occurred in createDoc", err);
                callback(null, JSON.stringify(err));
        }
        
        const currentScheduled = [];
        
        const updatedDocs = docs.map(doc => {
            if(doc.dates && doc.dates[doc.dates.length - 1]){
                const updatedDates = doc.dates.map(
                    date => {
                        //valid tweet
                        if(!moment().isAfter(date)){
                            const fiveMinsLater = moment().add(5,"minutes")
                            //tweet should happen now
                            if(fiveMinsLater.isAfter(date))
                                currentScheduled.push({
                                    screen_name: doc.screenName,
                                    oauthAccessToken: doc.oauthAccessToken,
                                    oauthAccessTokenSecret: doc.oauthAccessTokenSecret
                                })
                            return date;
                        }
                    }
                )
                if (updatedDates.length === 0)
                    return {
                        ...doc,
                        dates: [],
                        active: false
                    }
                return {...doc, dates: updatedDates}
                
            }
            return {};
        })

        const results = []

        var promises = currentScheduled.map((element) => {
            return fetch(`https://codechella-api.herokuapp.com/status/?oauth_token=${element.oauthAccessToken}&oauth_token_secret=${element.oauthAccessTokenSecret}`, {
                method : "POST",
                body:element.tweet || JSON.stringify({status: Math.floor(Math.random()*100).toString()}),
                headers: {
                    "Content-Type": "application/json"
                }
                
            })
            .then(
                res => res.json()
            )
            .then(
                response => results.push(response)
            )
        });
      
        Promise.all(promises).then(() => {
                console.log("POSTED ALL SCHEDULED TWEETS", results);
                callback(null, "SUCCESS!");
            }
        )
        .catch(
            err => console.log(err)
        );
            
        //db.close();
      });
  };