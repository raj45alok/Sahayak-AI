import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: 'Users',
  CONTENT: 'Content',
  WORKSHEETS: 'Worksheets',
  ASSIGNMENTS: 'Assignments',
  SUBMISSIONS: 'Submissions',
  PERFORMANCE: 'Performance',
  DOUBT_QUEUE: 'DoubtQueue',
};