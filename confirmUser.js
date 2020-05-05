import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const cryptoJS = require('crypto-js');


exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    //let body = event;
    var queryParams = {
        TableName: 'user',
        FilterExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": body.username.toLowerCase()
        }
    };
    var userElement = await documentClient.scan(queryParams).promise();
    if (userElement.Count != 1) throw new Error('Nombre de usuario o contraseña incorrecta.');
    var decryptedPassword = cryptoJS.AES.decrypt(userElement.Items[0].password, 'ultra-secret-code').toString(cryptoJS.enc.Utf8);
    if (decryptedPassword != body.password) throw new Error('Nombre de usuario o contraseña incorrecta.');
    return {
        id: userElement.Items[0].id,
        username: userElement.Items[0].username
    };
});
