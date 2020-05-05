import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid/v1');
const cryptoJS = require('crypto-js');


exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    var queryParams = {
        TableName: 'user',
        FilterExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": body.username
        }
    };
    var firstName = await documentClient.scan(queryParams).promise();
    if (firstName.Count > 0) throw new Error("El nombre de usuario ya existe.");
    var newUser = {
        id: `${uuid()}`,
        username: body.username.toLowerCase()
    };
    await dynamo.putItem({
        TableName: 'user',
        Item: {
            "id": { S:  newUser.id },
            "username": { S: newUser.username },
            "password": { S: cryptoJS.AES.encrypt(body.password, 'ultra-secret-code').toString() }
        }
    }).promise();
    return newUser;
});
