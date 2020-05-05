import handler from "./libs/handler-lib";

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB();
const translate = new AWS.Translate();
const uuid = require('uuid/v1');

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index]);
    }
};

exports.main = handler(async (event) => {
    let body = JSON.parse(event.body);
    //let body = event;
    const photo = body.photo;
    const extension = body.extension;
    const bucket = 'galleryappbucket';
    const id = `${uuid()}`;
    const filePath = `gallery/${id}.${extension}`;
    const username = body.username;
    let buf = Buffer.from(photo, 'base64');
    var photoElement = {
        id: id,
        username: username,
        path: filePath,
        tags: []
    };
    var paramsS3 = {
        Bucket: bucket,
        Key: filePath,
        Body: buf,
        ACL: 'public-read'
    };
    await s3.upload(paramsS3).promise();
    const paramsRekognition = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: filePath
            },
        },
        MaxLabels: 10
    };
    var data = await rekognition.detectLabels(paramsRekognition).promise();
    var tagSet = new Set();
    await asyncForEach(data.Labels, async (element) => {
        var translateParams = {
            SourceLanguageCode: 'en',
            TargetLanguageCode: 'es',
            Text: element.Name
        };
        var spanishText = await translate.translateText(translateParams).promise();
        tagSet.add(spanishText.TranslatedText);
    });
    photoElement.tags = Array.from(tagSet);
    await dynamo.putItem({
        TableName: 'photo',
        Item: {
            "id": { S: photoElement.id },
            "username": {S: photoElement.username },
            "path": { S: photoElement.path },
            "tags": { SS: photoElement.tags }
        }
    }).promise();
    return photoElement;
});