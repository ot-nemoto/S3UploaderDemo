'use strict';

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {

  console.log = console.log.bind(null, '[LOG]');
  console.info = console.info.bind(null, '[INFO]');
  console.warn = console.warn.bind(null, '[WARN]');
  console.error = console.error.bind(null, '[ERROR]');

  var id = (new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16));

  // variables
  var response = {};

  console.log(JSON.stringify(event));

  if (event.isBase64Encoded === true) {

    // decode
    var decode = new Buffer(event.body,'base64');

    // save data in s3
    var params = {
      Bucket: process.env.S3_BUCKET,
      Key: `${id}.jpg`,
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
        console.log(JSON.stringify(data));

        // DynamoDB
        var params = {
          Item: {
            "id": { S: `${id}` },
            "status": { S: "uploaded" },
            "s3-bucket-name": { S: process.env.S3_BUCKET },
            "s3-key": { S: `${id}.jpg` }
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