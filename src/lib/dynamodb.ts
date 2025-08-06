import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDBクライアントの初期化
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const dynamoClient = DynamoDBDocumentClient.from(client);

// ユーザー関連の関数
export const userDB = {
  // ユーザーを作成
  async createUser(userData: {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  }) {
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'board-app-users',
      Item: userData,
    });
    
    return await dynamoClient.send(command);
  },

  // メールアドレスでユーザーを検索
  async findUserByEmail(email: string) {
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'board-app-users',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });

    const result = await dynamoClient.send(command);
    return result.Items?.[0] || null;
  },

  // ユーザー名でユーザーを検索
  async findUserByUsername(username: string) {
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'board-app-users',
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    });

    const result = await dynamoClient.send(command);
    return result.Items?.[0] || null;
  },

  // ユーザーIDでユーザーを検索
  async findUserById(id: string) {
    const command = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'board-app-users',
      Key: { id },
    });

    const result = await dynamoClient.send(command);
    return result.Item || null;
  },

  // ユーザーを更新
  async updateUser(id: string, updates: Record<string, unknown>) {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.keys(updates).forEach((key, index) => {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      
      updateExpression.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = updates[key];
    });

    const command = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'board-app-users',
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    return await dynamoClient.send(command);
  },
};

// 投稿関連の関数
export const postDB = {
  // 投稿を作成
  async createPost(postData: {
    id: string;
    content: string;
    authorId: string;
    authorUsername: string;
    createdAt: string;
    updatedAt: string;
  }) {
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_POSTS_TABLE_NAME || 'board-app-posts',
      Item: postData,
    });
    
    return await dynamoClient.send(command);
  },

  // すべての投稿を取得
  async getAllPosts() {
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_POSTS_TABLE_NAME || 'board-app-posts',
      ScanIndexForward: false, // 新しい順
    });

    const result = await dynamoClient.send(command);
    return result.Items || [];
  },

  // 投稿IDで投稿を取得
  async getPostById(id: string) {
    const command = new GetCommand({
      TableName: process.env.DYNAMODB_POSTS_TABLE_NAME || 'board-app-posts',
      Key: { id },
    });

    const result = await dynamoClient.send(command);
    return result.Item || null;
  },

  // 投稿を更新
  async updatePost(id: string, updates: Record<string, unknown>) {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.keys(updates).forEach((key, index) => {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      
      updateExpression.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = updates[key];
    });

    const command = new UpdateCommand({
      TableName: process.env.DYNAMODB_POSTS_TABLE_NAME || 'board-app-posts',
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    return await dynamoClient.send(command);
  },

  // 投稿を削除
  async deletePost(id: string) {
    const command = new DeleteCommand({
      TableName: process.env.DYNAMODB_POSTS_TABLE_NAME || 'board-app-posts',
      Key: { id },
    });

    return await dynamoClient.send(command);
  },
}; 