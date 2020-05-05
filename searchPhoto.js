import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    let searchValue = body.value;
    var params = {
        TableName: 'photo'
    };
    var result = [];
    var photos = await documentClient.scan(params).promise();
    photos.Items.forEach(element => {
        var flag = false;
        let tagArray = Array.from(element.tags.values);
        tagArray.forEach(tag => {
            if (tag.toLowerCase().includes(searchValue.toLowerCase())) flag = true;
        });
        if (flag) result.push(element);
    });
    return result;
});