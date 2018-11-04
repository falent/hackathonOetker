var request = require("request");
module.exports = {
    initialize: function(link) {

        var options = {
            url: link,

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
};


