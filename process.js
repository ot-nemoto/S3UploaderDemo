'use strict';

const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context) => {

  console.log = console.log.bind(null, '[LOG]');
  console.info = console.info.bind(null, '[INFO]');
  console.warn = console.warn.bind(null, '[WARN]');
  console.error = console.error.bind(null, '[ERROR]');

  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    var params = {
      Key: record.dynamodb.Keys,
      TableName: process.env.DYNAMODB_TABLE
    };
    params.Key["Status"]["S"] = "uploaded";

    dynamodb.getItem(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(JSON.stringify(data));
      }
    });
    console.log('DynamoDB Record: %j', record.dynamodb);
  }
  return `Successfully processed ${event.Records.length} records.`;
};
