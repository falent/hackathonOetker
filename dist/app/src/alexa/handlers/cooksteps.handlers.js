
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

var position = 0;
var last = 0;


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
                console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC123');
                resolve(JSON.parse(body));
            }
        })
    })
}


module.exports = Alexa.CreateStateHandler(States.COOKSTEPS, {


    'cookstepsIntent': function() {
        var self = this;





        var userId = self.event.session.user.userId;

        console.log("before databank");
        connection.query('UPDATE names SET state = ? WHERE userid = ?', [position, userId], function (error, results) {
            if (error) throw error;
            console.log('!DATABANK UPDATE!');
        });


        var link = connection.query('SELECT json, state  FROM names WHERE userid=?', [userId],function (error, results) {

            if (error) throw error;

            console.log("select state");

            var json = JSON.parse(JSON.stringify(results))[0].json;
            var state = JSON.parse(JSON.stringify(results))[0].state;

            console.log("json parsing");

            console.log(position);
            console.log('STAAAAAAAAAAAAAAAATE');
            console.log(state);
            var initializePromise = initialize(json);
            return initializePromise.then(function(result) {


                const steps = result.PreparationBlocks.sort(function(a, b){return a.SortOrder-b.SortOrder});
                console.log('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
                console.log(steps);
                last = steps.length-1;
                    //console.log(++state);
                /*
                self.emit(':ask', "Es geht "+steps[0].Body );
                self.emit(':responseReady')*/

                var answer = "";
                var post ="";

                if(position == 0) {


                    answer = "Wir fangen an. ";
                } else if (position == last)
                    {
                        post = " Wir sind fertig! Guten Appetit!";
                    }


                answer += "Schritt " + steps[state].SortOrder + " : ";


               // self.response.speak("ssssssss");
                self.response.speak(answer +  steps[state].Body + post).listen(SpeechOutputUtils.pickRandom(self.t('REPEAT')));

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

    'AMAZON.PreviousIntent': function () {
        console.log('PREVIOS STEEEEEEEEEP');
        if (position == 0) {
            this.response.speak("Das ist der erste Schritt.").listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));

            this.emit(':responseReady');

        } else {
            position--;
            this.handler.state = States.COOKSTEPS;
            this.emit('cookstepsIntent');
        }
    },

    'AMAZON.NextIntent' : function () {
        console.log('NEEEEEEEEEEEEEEEEEEEEXT STEEEEEEEEEP');
        if (position == last) {
            this.response.speak("Das ist der letzte Schritt.").listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));
            this.emit(':responseReady');

        } else {
            position++;
            this.handler.state = States.COOKSTEPS;
            this.emit('cookstepsIntent');

        }
    },

    'AMAZON.RepeatIntent' : function () {
        console.log('REPEAAAAAAAAAAAAT');
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');

    },

    'AMAZON.StartOverIntent':function() {
        console.log('START OVEEEEER');
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');
    },

    'AMAZON.PauseIntent' : function () {
        console.log('PAUSE');
        //this.handler.state = States.COOKSTEPS;
        this.response.speak("Sag mir wenn ich weiterlesen soll").listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));

        this.emit(':responseReady');
    },

    'waitIntent' : function () {
        /*this.emit(':tell', "Sag mir wenn ich weiterlesen soll");
        this.emit(':responseReady');*/
        this.response.speak("Sag mir wenn ich weiterlesen soll").listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));

        this.emit(':responseReady');
    },

    'continueIntent':function () {
        console.log('RESUME');
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');
        //this.emit(':responseReady');
    },

    'laststepIntent' :function () {
        position = last;
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');
    },
    'buddyIntent' : function(){
        //this.handler.state = States.RECIPE;
        this.response.speak(SpeechOutputUtils.pickRandom(this.t('BUDDY_PROBLEM'))).listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));
        this.emit(':responseReady');
    }



});
