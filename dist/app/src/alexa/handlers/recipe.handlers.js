const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');var request = require("request");


var request = require("request");

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql7.freemysqlhosting.net',
    user     : 'sql7264034',
    password : 'gftjXBkx6Y',
    port : '3306',
    database : 'sql7264034'

});

var i = 0;






function initialize(recipe) {
    // Setting URL and headers for request
    //var url = "https://recipecloud-search.td-asp.com/recipes_de/_search?q=title:"+title;
    var url = "https://recipecloud-search.td-asp.com/recipes_de/_search?q=";
    if (recipe.name != undefined) {
        url += "title:"+recipe.name;

    }
    if(recipe.difficulty != undefined)
        if (recipe.difficulty.resolutions != undefined){
            if (recipe.name != undefined) url += "%20AND%20";
            url += "difficulty:"+recipe.difficulty.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        }
    if(recipe.category != undefined)
        if (recipe.category.resolutions != undefined) {
            if (recipe.name != undefined || recipe.difficulty.resolutions != undefined) url += "%20AND%20";
            url += "category:"+recipe.category.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        }
    var options = {
        //url: 'https://recipecloud-search.td-asp.com/recipes_de/_search?q=title:Erdbeer%20AND%20category:baking',
        url: url,
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
                resolve(JSON.parse(body));
            }
        })
    })
}

module.exports = Alexa.CreateStateHandler(States.RECIPE, {


    'recipeIntent': function() {
        var self = this;

        var myRecipe = {
            name : this.event.request.intent.slots.recipeName.value,
            //difficulty : this.event.request.intent.slots.difficulty.resolutions.resolutionsPerAuthority[0].values[0].value.id,
            difficulty : this.event.request.intent.slots.difficulty,
            //category : this.event.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.id
            category : this.event.request.intent.slots.category
        }
        //if (myRecipe.difficulty != undefined)
        console.log(myRecipe.name + " NAME");
        console.log(myRecipe.difficulty + " DIFF");
        console.log(myRecipe.category + " CATEGORY");
        var initializePromise = initialize(myRecipe );
        return initializePromise.then(function(result) {
            console.log(result);

            var curRecipe = result.hits.hits[i];
            var userId = self.event.session.user.userId;
            connection.query('UPDATE names SET state = ?, json = ?  WHERE userid = ?', ['0', curRecipe._source.recipe, userId], function (error, results) {
                if (error) throw error;
                console.log('!DATABANK UPDATE!');
            });

            const difficulty = ['leicht', 'nicht schwer', 'schwer'];


            self.emit(':ask', "Ich habe  "+result.hits.total+" Rezepte gefunden. " +curRecipe._source.title+" ist " + difficulty[curRecipe._source.difficulty-1] + " zu kochen und es dauert " + curRecipe._source.preparation_time +  " Minuten. Möchtest du es zubereiten?");
            self.emit(':responseReady');
            }, function(err) {
                console.log(err);
            })
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
        this.handler.state = States.RECIPE;
        console.log('NOOOOOOOOOOOOOOOOOOOOOOO');
        this.emitWithState('recipeIntent');
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
        this.handler.state = States.COOK;
        this.emitWithState('cookIntent');
    }
});