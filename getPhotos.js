import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.main = handler(async (event) => {
    var params = {
        TableName: 'photo'
    };
    var photos = await documentClient.scan(params).promise();
    return photos;
});