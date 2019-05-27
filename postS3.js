'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {

    // add logging level
    console.log = console.log.bind(null, '[LOG]');
    console.info = console.info.bind(null, '[INFO]');
    console.warn = console.warn.bind(null, '[WARN]');
    console.error = console.error.bind(null, '[ERROR]');

    // variables
    var response = {}

    // check event
    console.log(event)

    // if data is encoded with base64, then decode with base64 and save it in S3
    if (event.isBase64Encoded === true) {

        // decode
        var decode = new Buffer(event.body,'base64');

        // save data in s3
        var params = {
                        Bucket: process.env.S3_BUCKET, 
                        Key: 'ramen.jpg', 
                        ContentType: 'image/jpeg', 
                        Body: decode
                    };
        s3.putObject(params, function(err, data) {
            if (err) {
                console.error(err);
                console.error('image upload failed');

                // create response
                response.statusCode = 400
                response.body = JSON.stringify({
                    message: 'fail.'
                })
                callback(null, response);

            } else {
                console.log('image upload success');


                // DynamoDB
                var params = {
                  Item: {
                    "id": {
                      S: "Somewhat Famous"
                    }
                  },
                  ReturnConsumedCapacity: "TOTAL",
                  TableName: process.env.DYNAMODB_TABLE
                };
                dynamodb.putItem(params, function(err, data) {
                  if (err) {
                    console.log(err, err.stack);
                  } else {
                    console.log('create item success');
                  }
                });


                // create response
                response.statusCode = 200
                response.body = JSON.stringify({
                    message: 'image has been uploaded to S3'
                })
                callback(null, response);
            }
        });

    } else {

        // create response
        response.statusCode = 400
        response.body = JSON.stringify({
            message: 'fail.'
        })
        callback(null, response);
    }
};
