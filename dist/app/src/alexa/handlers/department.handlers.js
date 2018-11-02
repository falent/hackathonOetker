
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');


module.exports = Alexa.CreateStateHandler(States.DEPARTMENT, {

    'FindDepartmentIntent': function() {
        var myDepartment = this.event.request.intent.slots.department.value;
        
        this.response.speak(SpeechOutputUtils.pickRandom(this.t('DEPARTAMENT', myDepartment)))
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
