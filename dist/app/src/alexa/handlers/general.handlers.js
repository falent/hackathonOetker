const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
const connection = require('../models/con');
const Alexa = require('alexa-sdk');

const RandomDate = require('../utils/random-date.utils');

const callMe = require('../utils/call.utils');



module.exports = Alexa.CreateStateHandler(States.GENERAL,{


    'recipeIntent': function() {


    },


    // Unhandled Intent:

    'Unhandled': function () {

        this.handler.state = States.NONE;
        this.emit('Unhandled'); // emit in newSession handlers
    },

    // Built-In Intents:
    'AMAZON.HelpIntent': function () {

        this.emit(':ask', "");
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = States.NONE;
        console.log('NOOOOOOOOOOOOOOOOOOOOOOO');
        this.emitWithState('AMAZON.HelpIntent');
    },
    'AMAZON.YesIntent': function() {

        console.log('YEEEEEEEEEEEEEES INTENT');

            if (this.attributes.lastState==="new"){

                this.handler.state = States.RECIPE;
                this.emitWithState('recipeIntent');

            }


    },
    'AMAZON.StopIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.CancelIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.CancelIntent');
    },

    //OTHERS
    'shoppingListIntent': function() {
        this.handler.state = States.SHOPPINGLIST;
        this.emitWithState(':shoppingListIntent');
    },
    'addProductIntent': function() {

        var userId = this.event.session.user.userId;
        var myFood = this.event.request.intent.slots.food.value;
        this.attributes.myFood = myFood;

        var extraOutput = "";

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


            if (myFood=="eier" || myFood == "Eier"){

                myDate = "11-04-2018";
                extraOutput = "<audio src='https://www.jovo.tech/audio/jmy1wNoQ-alarm-mp3cutnet.mp3' /> Achtung! Die Halbarkeit ist kurz! Ich kann dir eine gute Vorschlage geben um was zu kochen. Möchtest du es jetzt machen?";
            }



            self.response.speak("Ich lege und scanne <audio src='https://www.jovo.tech/audio/Ry3Pirzx-scanner.mp3' />  "+myFood+" in den Kühlschrank!. Dein Essen ist bis "+myDate+" haltbar "+extraOutput).listen("was möchtest du machen?");
            //.renderTemplate(template);; to do
            self.emit(':responseReady');




        }, function(err) {
            console.log(err);
        })
    }

});