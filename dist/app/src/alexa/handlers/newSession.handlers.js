// newSession.handlers.js

const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
const connection = require('../models/con');












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
    'ContactIntent': function() {
        this.response.speak("Our department is here where it is and has no phone number!!  ")
            .listen("do you want something elsee?");
        this.emit(':responseReady');
    },

    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.response.speak(SpeechOutputUtils.pickRandom(this.t('HELP')));
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
    'Unhandled': function () {
        this.response.speak("sdsdsd").listen("sss");
        this.emit(':responseReady');

    },

    'addProductIntent': function () {

        var userId = this.event.session.user.userId;
        var myFood = this.event.request.intent.slots.food.value;

        var post  = {id: null, userId: userId, ingredient: myFood };
        var query = connection.query('INSERT INTO ingredients SET ?', post, function (error, results, fields) {
            if (error) throw error;
            // Neat!
        });

        this.emit(':ask', "Ich lege und scanne <audio src='https://www.jovo.tech/audio/Ry3Pirzx-scanner.mp3' />  "+myFood+" in den Kühlschrank!");


    }
};
