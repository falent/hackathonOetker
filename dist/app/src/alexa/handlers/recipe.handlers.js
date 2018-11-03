
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');




var request = require("request");
var weather;
var yourApiKey = 'b32bcfcda4ae45cbb0b57dd17ceaa1fe';

function initialize(city) {
    // Setting URL and headers for request
    var options = {
        url: 'https://recipecloud-search.td-asp.com/recipes_de/_search?q=title:Erdbeer%20AND%20category:baking',

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
                resolve(JSON.parse(body));
            }
        })
    })

}



module.exports = Alexa.CreateStateHandler(States.RECIPE, {

    'recipeIntent': function() {


        var self = this;
        var initializePromise = initialize(myRecipe);
        return initializePromise.then(function(result) {


            console.log(result)

            self.emit(':ask', "In the next hour in  The temperature is ");

            self.emit(':responseReady');

        }, function(err) {
            console.log(err);
        })

        

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
