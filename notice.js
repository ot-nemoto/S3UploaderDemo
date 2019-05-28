'use strict';

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient();

exports.handler = (event, context) => {

  console.log = console.log.bind(null, '[LOG]');
  console.info = console.info.bind(null, '[INFO]');
  console.warn = console.warn.bind(null, '[WARN]');
  console.error = console.error.bind(null, '[ERROR]');

  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    var params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        "Id": record.dynamodb.Keys["Id"]["S"]
      }
    };
    console.log(`params: GetItem: ${JSON.stringify(params)}`);
    docClient.get(params, function(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

        if (data.Item.Status != "processed") return;




        // Update Status
        var updateParams = {
          TableName: params.TableName,
          Key: params.Key,
          UpdateExpression: "set #status = :status",
          ExpressionAttributeNames: {
            "#status": "Status"
          },
          ExpressionAttributeValues: {
            ":status": "notified"
          },
          ReturnValues:"UPDATED_NEW"
        };
        console.log(`params: UpdateItem: ${JSON.stringify(updateParams)}`);
        docClient.update(updateParams, function(err, data) {
          if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
          }
        });
      }
    });
  }
};
