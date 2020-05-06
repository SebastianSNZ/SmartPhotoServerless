import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    let username = body.username;
    var params = {
        TableName: 'photo',
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username
        }
    };
    var photos = await documentClient.scan(params).promise();
    return photos;
});