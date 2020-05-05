import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    let searchValue = body.value;
    var params = {
        TableName : "photo",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames:{
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id": searchValue
        }
    };
    var photo = await documentClient.query(params).promise();
    return photo;
});