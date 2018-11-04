const Alexa = require('alexa-sdk');

module.exports = {
    getTemplate: function(foreground, err) {



            const builder = new Alexa.templateBuilders.BodyTemplate7Builder();
            const template = builder.setBackgroundImage(Alexa.utils.ImageUtils.makeImage('https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png'))
                .setBackButtonBehavior('HIDDEN')
                .setImage(Alexa.utils.ImageUtils.makeImage(foreground))
                .build();
            if (err) {
                reject(err);
            }
            return template;

        }


};



