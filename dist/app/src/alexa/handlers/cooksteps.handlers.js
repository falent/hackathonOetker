
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var request = require("request");


var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql2.freemysqlhosting.net',
    user     : 'sql2264064',
    password : 'wI4%lS9%',
    port : '3306',
    database : 'sql2264064'

});


function initialize(link) {

    console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
    console.log(link)
    var options = {
        //url: 'https://recipecloud-search.td-asp.com/recipes_de/_search?q=title:Erdbeer%20AND%20category:baking',
        url: link,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise
    return new Promise(function(resolve, reject) {
        // Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC');
                resolve(JSON.parse(body));
            }
        })
    })
}


module.exports = Alexa.CreateStateHandler(States.COOKSTEPS, {

    'cookstepsIntent': function() {
        var self = this;



        var userId = self.event.session.user.userId;


        var link = connection.query('SELECT json, state  FROM names WHERE userid=?', [userId],function (error, results) {

            if (error) throw error;



            var json = JSON.parse(JSON.stringify(results))[0].json;
            var state = JSON.parse(JSON.stringify(results))[0].state;
            connection.query('UPDATE names SET state = ? WHERE userid = ?', [''+(++state), userId], function (error, results) {
                if (error) throw error;
                console.log('!DATABANK UPDATE!');
            });
            console.log('STAAAAAAAAAAAAAAAATE');
            console.log(state);
            var initializePromise = initialize(json);
            return initializePromise.then(function(result) {


                const steps = result.PreparationBlocks.sort(function(a, b){return a.SortOrder-b.SortOrder});
                console.log('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
                console.log(steps);
                //console.log(++state);
                /*
                self.emit(':ask', "Es geht "+steps[0].Body );
                self.emit(':responseReady')*/



                self.response.speak(steps[state].Body).listen(SpeechOutputUtils.pickRandom(self.t('REPEAT')));

                self.emit(':responseReady');


            }, function(err) {
                console.log(err);
            })


        });










        

    },

    // Unhandled Intent:

    'Unhandled': function () {
        this.handler.state = States.NONE;
        this.emit('Unhandled'); // emit in newSession handlers
    },

    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.handler.state = States.NONE;
        this.emit(':ask', SpeechOutputUtils.pickRandom(this.t('HELP')));
    },

    'AMAZON.NoIntent': function() {
        this.handler.state = States.NONE;
        this.emit('AMAZON.CancelIntent');
    },

    'AMAZON.StopIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.CancelIntent');
    },

    'AMAZON.NextIntent' : function () {
        console.log('NEEEEEEEEEEEEEEEEEEEEEEEEEEEXT STEEEEEEEEEP');
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');
    }

});
