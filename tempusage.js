const oauth = require('oauth');



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

consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){ //callback with request token
    if (error) {
        console.log(JSON.stringify(error));
    } else {         
        // req.session.oauthRequestToken = oauthToken;
        // req.session.oauthRequestTokenSecret = oauthTokenSecret;
        
        console.log(oauthToken+ " "+ oauthTokenSecret)
        console.log(results)
        const data = {
            redirectUrl : "https://api.twitter.com/oauth/authorize?oauth_token="+oauthRequestToken
        }
        // console.log(req.session)
        // console.log("REQ SESSION AFTER INIT")
        console.log("VISIT : ", "https://api.twitter.com/oauth/authorize?oauth_token="+oauthRequestToken)
        console.log("Get the value of the query param, oauth_verifier and paste it below:")
        //console.log(data); 
        
        const stdin = process.openStdin();
        stdin.addListener('data', text => {
            const oauthVerifier = text.toString().trim()
            stdin.pause();
            
            getAccessToken(oauthAccessToken, oauthAccessTokenSecret, oauthVerifier)

          })

    }
});

const getAccessToken = (past_oauthAccessToken, past_oauthAccessTokenSecret, oauthVerifier) => {
    consumer().getOAuthAccessToken(
            past_oauthAccessToken,//req.session.oauthRequestToken, 
            past_oauthAccessTokenSecret,//req.session.oauthRequestTokenSecret, 
            oauthVerifier,//req.query.oauth_verifier, 

            function(error, oauthAccessToken, oauthAccessTokenSecret, results) { //callback when access_token is ready
                if (error) {
                    console.log("Error getting OAuth access token : " + JSON.stringify(error), 500);
                } else {
                //   req.session.oauthAccessToken = oauthAccessToken;
                //   req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
            
                    console.log("Converted to Access Tokens: ")
                    console.log(oauthAccessToken + " " + oauthAccessTokenSecret)
                    console.log("Save the first value somewhere, you can keep using this to make priviledged requests")
                    consumer().get("https://api.twitter.com/1.1/account/verify_credentials.json", 
                                    oauthAccessToken, 
                                    oauthAccessTokenSecret, 
                                    function (error, data, response) {  //callback when the data is ready
                                        if (error) {
                                        console.log("Error getting twitter screen name : " + error, 500);
                                        } else {
                                            data = JSON.parse(data);
                                            twitterScreenName = data["screen_name"];  
                                            twitterLocaltion = data["location"];  
                                            console.log('You are signed in with Twitter screenName ' + twitterScreenName + ' and twitter thinks you are in '+ twitterLocaltion);
                                            console.log(data)
                                        }             
                                    }
                                );  
                }
      });
}
    