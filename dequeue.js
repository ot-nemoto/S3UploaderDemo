'use strict';

const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = async (event, context) => {
  console.log('Loading function');
  //console.log('Received event:', JSON.stringify(event, null, 2));
  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  }
  return `Successfully processed ${event.Records.length} records.`;
};
