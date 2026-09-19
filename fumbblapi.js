var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var host = "fumbbl.com";


module.exports = {
    get_current_matches: function(res){

        var matches_options = {
            host: host,
            path:"/api/match/current",
            method:"GET"
        };

        matches_callback = function(response) {
            var str = "";
            response.on('data', function (data) {
                str += data;
            });

            response.on('end', function () {
                try {
                    res.json(JSON.parse(str));
                } catch (e) {
                    res.status(502).json({error: "Could not fetch matches: " + str});
                }
            });
        };

        var matches_req = https.request(matches_options, matches_callback);
        matches_req.on('error', function(e) { res.status(502).json({error: e.message}); });
        matches_req.end();
    },

    // Exchanges a FUMBBL OAuth app's Client ID/Secret (client-credentials grant,
    // see https://fumbbl.com/p/oauth) for an auth token this client can join
    // games with. Credentials normally come from the login form's POST body;
    // auth.json is kept only as an optional local default for anyone who still
    // wants a zero-click dev setup.
    authenticate: function(res, credentials){
        // A malformed/blocked response from fumbbl.com (e.g. no route to the
        // host) must not crash the dev server for every connected client -
        // report it to the browser as a failed login instead.
        var failAuth = function(message) {
            res.status(502).json({error: "FUMBBL authentication failed: " + message});
        };

        var proceed = function(user_id, client_id, client_secret) {
            var form = {
                grant_type: "client_credentials",
                client_id: client_id,
                client_secret: client_secret,
            };
            var formData = querystring.stringify(form);
            var contentLength = formData.length;

            var bearer_options = {
                host: host,
                path:"/api/oauth/token",
                method:"POST",
                headers:{"Content-Type":"application/x-www-form-urlencoded" }
            };

            auth_callback = function(response) {
                var str = "";
                response.on('data', function (data) {
                    str += data;
                });

                response.on('end', function () {
                    try {
                        res.json({user_id: user_id, token:JSON.parse(str)});
                    } catch (e) {
                        failAuth(str);
                    }
                });
            };

            bearer_callback = function(response) {
                var str = "";
                response.on('data', function (data) {
                    str += data;
                });

                response.on('end', function () {
                    var bearer;
                    try {
                        bearer = JSON.parse(str);
                    } catch (e) {
                        failAuth(str);
                        return;
                    }

                    var auth_token_options = {
                        host: host,
                        path:"/api/auth/getToken",
                        method:"POST",
                        headers:{
                            accept: "application/json",
                            Authorization: " Bearer " + bearer.access_token
                        }

                    };

                    var auth_req = https.request(auth_token_options, auth_callback);
                    auth_req.on('error', function(e) { failAuth(e.message); });
                    auth_req.end();
                });
            }

            var bearer_req = https.request(bearer_options, bearer_callback);
            bearer_req.on('error', function(e) { failAuth(e.message); });
            bearer_req.write(querystring.stringify(form));
            bearer_req.end();
        };

        credentials = credentials || {};
        if (credentials.client_id && credentials.client_secret && credentials.user_id) {
            proceed(credentials.user_id, credentials.client_id, credentials.client_secret);
        } else {
            fs.readFile('auth.json', function(err, data) {
                if (err) {
                    res.status(400).json({error: "No FUMBBL Client ID/Secret provided"});
                    return;
                }
                var json_data = JSON.parse(data);
                proceed(json_data.user_id, json_data.client_id, json_data.secret);
            });
        }
    }
}
