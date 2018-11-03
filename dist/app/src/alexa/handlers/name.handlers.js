
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');


/*
TODO at the end uncomment
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dupa',
    database : 'oetker'
});
*/


module.exports = Alexa.CreateStateHandler(States.NAME, {

    'nameIntent': function() {
/*

        var myName = this.event.request.intent.slots.name.value;
        var userId = this.event.context.System.user.userId;

        var post  = {id: null, name: myName, userId: userId};
        var query = connection.query('INSERT INTO names SET ?', post, function (error, results, fields) {
            if (error) throw error;
            // Neat!
        });
        console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'



        this.response.speak(SpeechOutputUtils.pickRandom(this.t('NAME', myName)))
            .listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));

        this.emit(':responseReady');
*/      this.response.speak(SpeechOutputUtils.pickRandom(this.t('WELCOME_TEMPORAL'))).listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));
        this.emit(':responseReady');




        

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
