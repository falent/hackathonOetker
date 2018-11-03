// newSession.handlers.js

const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');





var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql7.freemysqlhosting.net',
    user     : 'sql7264034',
    password : 'gftjXBkx6Y',
    port : '3306',
    database : 'sql7264034'

});








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

        connection.query('SELECT * FROM names', function (error, results) {
            if (error) throw error;

            var userId = self.event.context.System.user.userId;
                    var i;
                    for (i = 0; i < results.length; i++) {

                        if (results[i].userId == userId) {
                            console.log("IT IS TRUE!");
                            console.log(results[i].name);
                            output = SpeechOutputUtils.pickRandom(self.t('WELCOME_NAME', results[i].name));
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
    'ContactIntent': function() {
        this.response.speak("Our department is here where it is and has no phone number!!  ")
            .listen("do you want something elsee?");
        this.emit(':responseReady');
    },

    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.response.speak(SpeechOutputUtils.pickRandom(this.t('HELP')).listen(this.t('REPEAT')));
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

    }
};
