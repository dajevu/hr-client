var amqp = require('amqp');

function receive() {
    var exchange = conn.exchange('', {confirm:false}); // get the default exchange
    var queue = conn.queue('queue-request-hr', {}, function () { // create a queue

        queue.subscribe({ack:false}, function (message, headers, properties, m) { // subscribe to that queue

            console.log(message.body); // print new messages to the console
            console.log(properties.correlationId);

            var request = message.body;
            var response;

            console.log("message property is:: " + request.accountInquery.companyLogin);

            if (request.accountInquery.companyLogin.indexOf("HR") != -1) {
                response = new Response(true, "WD-3232-322");
            } else
                response = new Response(false, "");

            var replyQueue = conn.queue(properties.replyTo, function () {
                // publish a message
                exchange.publish(replyQueue.name, {body: response},
                    {"correlationId":properties.correlationId, "headers": [{"target" : "HRPlatform"}]});
            });

        });
    });
}

function Response (bool, systemId) {
    this.claimRequest = bool;
    this.systemId = systemId;
}

var url = "amqp://app9175480_heroku.com:33lZN5u8xbmsYVxEETHn7NiCltSSqgSF@tiger.cloudamqp.com/app9175480_heroku.com";// hosted by heroku
var conn = amqp.createConnection({url:url}); // create the connection
conn.on('ready', receive); // when connected, call "receive"

