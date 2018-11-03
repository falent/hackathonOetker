
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var request = require("request");
const connection = require('../models/con');



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


module.exports = Alexa.CreateStateHandler(States.COOK, {

    'cookIntent': function() {
        var self = this;


        var userId = this.event.session.user.userId;

        var link = connection.query('SELECT json FROM names WHERE userid=?', [userId],function (error, results) {

            if (error) throw error;



            var json = JSON.parse(JSON.stringify(results))[0].json;

            var initializePromise = initialize(json);
            return initializePromise.then(function(result) {



                var i;
                var j;
                var all = "";



                for (j = 0; j < result.IngredientBlocks.length; j++) {



                    all += " "+result.IngredientBlocks[j].Title;


                for (i = 0; i < result.IngredientBlocks[j].Ingredients.length; i++) {


                    all += " "+result.IngredientBlocks[j].Ingredients[i].Text+"<break time='1s'/>";

                }
                }

                self.response.speak(SpeechOutputUtils.pickRandom(self.t('COOK_INGREDIENTS', all))+" Möchten Sie die Produkte bei Dr Oetker besttelen?").listen(SpeechOutputUtils.pickRandom(self.t('REPEAT'))).cardRenderer("ss", "ss");;


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

    'AMAZON.YesIntent' : function () {
        this.handler.state = States.SHOPPING;
        this.emitWithState('shoppingIntent');
    }

});
