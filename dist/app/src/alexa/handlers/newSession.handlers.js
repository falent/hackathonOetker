// newSession.handlers.js

const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
const connection = require('../models/con');
const Alexa = require('alexa-sdk');

const RandomDate = require('../utils/random-date.utils');

const callMe = require('../utils/call.utils');








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

        var query = connection.query('TRUNCATE ingredients ', function (error) {
            if (error) throw error;
            // Neat!
        });

        this.emit(':ask', "<audio src='https://www.jovo.tech/audio/aaU4YRxc-output1.mp3' /> aber ich habe alle produkte weggeschissen!");
    },

    'addProductIntent': function () {


        var userId = this.event.session.user.userId;
        var myFood = this.event.request.intent.slots.food.value;

        var initializePromise = callMe.initialize("https://www.googleapis.com/customsearch/v1?googlehost=google.co.uk&safe=medium&searchType=image&key=AIzaSyBM4seUp34UjloDGy-5SLz-6W7mQ0waLCI&cx=014853195659919022276:i07jr-y6e6m&q="+myFood);
        var self = this;
        var myLink = "";
        return initializePromise.then(function(result) {

            myLink=result.items[0].link;


            var myDate = RandomDate.randomDate('11-04-2018', '11-11-2018');

            const builder = new Alexa.templateBuilders.BodyTemplate7Builder();
            const template = builder.setBackgroundImage(Alexa.utils.ImageUtils.makeImage('https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png'))
                .setBackButtonBehavior('HIDDEN')
                .setImage(Alexa.utils.ImageUtils.makeImage(myLink))
                .build();


            var post  = {id: null, userId: userId, ingredient: myFood, bestBefore:  myDate};
            var query = connection.query('INSERT INTO ingredients SET ?', post, function (error, results, fields) {
                if (error) throw error;
                // Neat!
            });

            console.log(myLink);
            console.log(myFood);






            self.response.speak("Ich lege und scanne <audio src='https://www.jovo.tech/audio/Ry3Pirzx-scanner.mp3' />  "+myFood+" in den Kühlschrank!. Dein Essen ist bis "+myDate+" haltbar").listen("do you want something elsee?").renderTemplate(template);;
            self.emit(':responseReady');




        }, function(err) {
            console.log(err);
        })


    }
};
