
const Alexa = require('alexa-sdk');
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


module.exports = Alexa.CreateStateHandler(States.COOK, {

    'cookIntent': function() {


        //var myName = this.event.request.intent.slots.name.value;
        var userId = this.event.session.user.userId;
        //var state = "";
        //var json = "";
        /*
        console.log("THIS IS USERID")
        console.log(userId);*/

        /*var post  = {id: null, name: myName, userId: userId, state: state, json: json};
        var query = connection.query('INSERT INTO names SET ?', post, function (error, results, fields) {
            if (error) throw error;
            // Neat!
        });
        console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
*/
        var step = connection.query('SELECT json FROM names WHERE userid='+userId,function (error, results) {
            if (error) throw error;
        });

        console.log(step.sql);

        this.response.speak(SpeechOutputUtils.pickRandom(this.t('COOK', myName)))
            .listen(SpeechOutputUtils.pickRandom(this.t('REPEAT')));

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
