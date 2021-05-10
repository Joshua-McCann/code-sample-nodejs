const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-west-2'
  // what could you do to improve performance?
});

const tableName = 'SchoolStudents';
const studentLastNameGsiName = 'studentLastNameGsi';
const secondaryParam = 'studentLastName'
const primaryParam = ['schoolId', 'studentId']

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = async (event) => {

  let query = {
    TableName: tableName,
    KeyConditionExpression: '',
    ExpressionAttributeValues: {},
    Limit: 5
  };

  let keyExpression = [];
  let params = primaryParam

  // if the event only has a last name, use the secondary index
  if (secondaryParam in event && Object.keys(event).length === 1) {
    query.IndexName = studentLastNameGsiName
    params = [secondaryParam]
  }

  // add query properties from valid properties
  for (const i in params) {
    const param = params[i]
    if (!!event[param]) {
      let val = `:val${i}`
      keyExpression.push(`${param} = ${val}`);
      query.ExpressionAttributeValues[val] = event[param];
    }
  }
  query.KeyConditionExpression = keyExpression.join(' and ');

  // keep calling the database with the last evaluated key if there is one
  let result = [];
  let promise;
  do {
    promise = await dynamodb.query(query).promise();
    result = result.concat(promise.Items);
    query.ExclusiveStartKey = promise.LastEvaluatedKey;
  } while(promise.LastEvaluatedKey);
  return result;
};