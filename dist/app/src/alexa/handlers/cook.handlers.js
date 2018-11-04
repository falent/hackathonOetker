
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var request = require("request");
const connection = require('../models/con');
var unique = require('array-unique');
const RandomDate = require('../utils/random-date.utils');

const callMe = require('../utils/call.utils');
var state = "";

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
                console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC1234');
                resolve(JSON.parse(body));
            }
        })
    })
}

function wordInString(s, word){
    return new RegExp( '\\b' + word + '\\b', 'i').test(s);
}

var ingredientsArrayToDatabase = [];

module.exports = Alexa.CreateStateHandler(States.COOK, {

    'cookIntent': function() {
        var self = this;


        var userId = this.event.session.user.userId;

        var link = connection.query('SELECT json FROM names WHERE userid=?', [userId],function (error, results) {

            if (error) throw error;



            var json = JSON.parse(JSON.stringify(results))[0].json;

            var initializePromise = initialize(json);
            return initializePromise.then(function(result) {


                var ingredients = connection.query('SELECT ingredient FROM ingredients WHERE userid=?', [userId],function (error, results) {

                    ingredientsArrayToDatabase = [];
                    if (error) throw error;

                    var ingredientsArray = [];



                    var k;
                    for (k = 0; k < results.length; k++) {


                        ingredientsArray.push(JSON.parse(JSON.stringify(results))[k].ingredient);

                    }




                    var i;
                    var j;
                    var all = "";


                    var word;
                    var sentence;
                    for (j = 0; j < result.IngredientBlocks.length; j++) {



                        all += " "+result.IngredientBlocks[j].Title;



                        for (i = 0; i < result.IngredientBlocks[j].Ingredients.length; i++) {


                            sentence = (result.IngredientBlocks[j].Ingredients[i].Text).toLowerCase();

                            for (k = 0; k < ingredientsArray.length; k++) {


                                 word = (ingredientsArray[k].toLowerCase());




                                if (wordInString(sentence, word)){
                                    console.log(sentence);
                                    console.log(word);
                                    sentence = sentence+" es gibt"
                                } else {

                                    var sentenceNew = sentence.replace(/[0-9]/g, '');
                                    ingredientsArrayToDatabase.push(sentenceNew);

                                }





                            }



                            all += " "+sentence+"<break time='0.4s'/>";

                        }
                    }

                    all = all.replace("gestr.", "gestrichenen").replace("tl", "Teelöffel").replace("pck.", "Packung ").replace("z. b.", "Zum Beispiel");


                    self.response.speak(SpeechOutputUtils.pickRandom(self.t('COOK_INGREDIENTS', all))+" Leider haben Sie nicht alle Produkte. Soll ich es bestellen?")
                        .listen(SpeechOutputUtils.pickRandom(self.t('REPEAT')))
                        .cardRenderer(results.title, SpeechOutputUtils.pickRandom(self.t('COOK_INGREDIENTS', all)));


                    self.emit(':responseReady');

                }, function(err) {
                    console.log(err);
                })





            }, function(err) {
                console.log(err);
            })







        });












    },

    // Unhandled Intent:



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
        this.handler.state = States.COOKSTEPS;
        this.emit('cookstepsIntent');
    },

    'AMAZON.StopIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.CancelIntent');
    },

    'AMAZON.PauseIntent' : function () {
        console.log('PAUSE');
        this.handler.state = States.COOK;
        //this.emit('AMAZON.PauseIntent');
        this.emit(':responseReady');
    },

    'deleteProductsIntent': function () {

        var query = connection.query('TRUNCATE ingredients ', function (error) {
            if (error) throw error;
            // Neat!
        });

        this.emit(':ask', "<audio src='https://www.jovo.tech/audio/aaU4YRxc-output1.mp3' /> aber ich habe alle produkte weggeschissen!");
    },

    'addProductIntent': function () {


        this.event.session.user.lastState = States.COOK;
        this.handler.state = States.GENERAL;
        this.emitWithState('addProductIntent');


    },


    'AMAZON.YesIntent' : function () {

        var myArray = unique(ingredientsArrayToDatabase);

        var j;
        for (j = 0; j < myArray.length; j++) {
            var userId = this.event.session.user.userId;

            var post  = {id: null, userId: userId, ingredient: myArray[j] };
            var query = connection.query('INSERT INTO ingredients SET ?', post, function (error, results, fields) {
                if (error) throw error;
                // Neat!
            });

        }
        this.emit(':ask', "<audio src='https://www.jovo.tech/audio/VEYqi8zP-output.mp3' /> Ich habe sie hinzufügt" + myArray.join().replace("gestr.", "gestrichenen").replace("tl", "Teelöffel").replace("pck.", "Packung ").replace("z. b.", "Zum Beispiel"));
    },

    'startcookIntent' : function () {
       /*// this.response.speak("Wir fangen an").listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));
        this.emit(':tell', "Wir fangen an");

        this.emit(':responseReady');*/

        this.handler.state = States.COOKSTEPS;
        this.emitWithState('cookstepsIntent');
    }

});
