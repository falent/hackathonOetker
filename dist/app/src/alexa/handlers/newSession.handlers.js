// newSession.handlers.js

const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
const connection = require('../models/con');
const Alexa = require('alexa-sdk');

const RandomDate = require('../utils/random-date.utils');

const callMe = require('../utils/call.utils');

var state = "";






const inNewSessionStartableIntents = [
    'SharePriceIntent'
];

module.exports = {

    'NewSession': function() {

        /*

        TODO at the end uncomment

        // Intent Request:
        if (this.event.request.type === 'IntentRequest') {
            const intentName = this.event.request.intent.name;
            if (inNewSessionStartableIntents.indexOf(intentName) > -1) {
                return this.emit(intentName);
            }
        }
        // else: Launch Request
        */
        this.emit('LaunchIntent');
    },

    'LaunchIntent': function() {





        var self = this;
        var output = "";

        console.log('CAME IN');
        connection.query('SELECT * FROM names', function (error, results) {
            if (error) throw error;

            var userId = self.event.session.user.userId;
                    var i;

            console.log(userId + ' userid');
                    for (i = 0; i < results.length; i++) {
                        console.log(i);
                        console.log(results[i].userId);
                        console.log("");
                        console.log(userId);
                        if (results[i].userId === userId) {

                            console.log(results[i].name);


                            output = SpeechOutputUtils.pickRandom(self.t('GREETINGS', results[i].name))+" "+SpeechOutputUtils.pickRandom(self.t('WELCOME_NAME'));
                            break;
                        }else {
                            output = SpeechOutputUtils.pickRandom(self.t('WELCOME_WITHOUT_NAME'));
                        }
                    }









            self.response.speak(output).listen(self.t('REPEAT'));
            self.emit(':responseReady');


        });


},
    // Custom Intents:
    'nameIntent': function() {
        this.handler.state = States.NAME;
        this.emitWithState('nameIntent');
    },
    // Custom Intents:
    'recipeIntent': function() {
        this.handler.state = States.RECIPE;
        this.emitWithState('recipeIntent');
    },
    'cookIntent': function() {
        this.handler.state = States.COOK;
        this.emitWithState('cookIntent');
    },
    'cookstepsIntent': function() {
        this.handler.state = States.COOKSTEPS;
        this.emitWithState('cookstepsIntent');
    },

    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.response.speak(SpeechOutputUtils.pickRandom(this.t('HELP_NEW_SESSION'))).listen(SpeechOutputUtils.pickRandom(this.t('HELP_ASK')));
        this.emit(':responseReady');

    },

    'AMAZON.StopIntent': function () {
    	this.response.speak(SpeechOutputUtils.pickRandom(this.t('STOP_ANSWER')));
        this.emit(':responseReady');

    },

    'AMAZON.CancelIntent': function () {
    	this.response.speak(SpeechOutputUtils.pickRandom(this.t('CANCEL_ANSWER')));
        this.emit(':responseReady');
    },

    'renderImageIntent': function () {
        const builder = new Alexa.templateBuilders.BodyTemplate7Builder();
        const template = builder.setBackgroundImage(Alexa.utils.ImageUtils.makeImage('https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png'))
            .setBackButtonBehavior('HIDDEN')
            .setImage(Alexa.utils.ImageUtils.makeImage('https://recipecloud-data.td-asp.com/recipes_de/recipe_D199D2ACC927305EC125735600413A25/recipe.jpeg'))
            .build();

        this.response.speak('Rendering a template!')
            .renderTemplate(template);
        this.emit(':responseReady');

    },

    'deleteProductsIntent': function () {


        this.attributes.lastState = "new";
        this.handler.state = States.GENERAL;
        this.emitWithState('deleteProductsIntent');
    },

    'addProductIntent': function () {

        this.attributes.lastState = "new";
        this.handler.state = States.GENERAL;
        this.emitWithState('addProductIntent');

    },


    'AMAZON.YesIntent' : function () {

        this.handler.state = States.RECIPE;
        this.handler.myFood = "eier";
        this.emitWithState('recipeIntent');
    },
    'Unhandled': function () {
        this.response.speak("Ich habe dich nicht verstanden").listen("kannst du es bitte wiederholen?");
        this.emit(':responseReady');

    }
};
