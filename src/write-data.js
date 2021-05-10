const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: new AWS.Endpoint('http://localhost:8000'),
  region: 'us-west-2',
  // what could you do to improve performance?
});

const tableName = 'SchoolStudents';
const validProperties = ['schoolId', 'schoolName', 'studentId', 'studentFirstName', 'studentLastName', 'studentGrade']

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = (event) => {

  const query = {
    TableName: tableName,
    Item: event
  };

  const invalidProperties = validProperties.filter((prop) =>  !event[prop] )

  if (invalidProperties.length > 0) throw new Error(`Invalid properties when attempting to save: ${invalidProperties.join(', ')}`)

  return dynamodb.put(query).promise();

};