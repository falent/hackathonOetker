
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var request = require("request");

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql7.freemysqlhosting.net',
    user     : 'sql7264034',
    password : 'gftjXBkx6Y',
    port : '3306',
    database : 'sql7264034'

});


function initialize(link) {

    console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
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


module.exports = Alexa.CreateStateHandler(States.COOK, {

    'cookIntent': function() {
        var self = this;


        var userId = this.event.session.user.userId;

        var link = connection.query('SELECT json FROM names WHERE userid=?', [userId],function (error, results) {

            if (error) throw error;

            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            //console.log(results[0].RowDataPacket);
            /*
            var string=JSON.stringify(results);
            var json =  JSON.parse(string);
            console.log('>> true json: ', json[0].json);*/

            var json = JSON.parse(JSON.stringify(results))[0].json;
            //console.log(results[0].json);
            console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
            var initializePromise = initialize(json);
            return initializePromise.then(function(result) {
                console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
                console.log(result);
                console.log(result.PreparationBlocks[0].Body);
                console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

                self.emit(':ask', "Es geht "+result.PreparationBlocks[0].Body );
                self.emit(':responseReady')
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
    }

});
