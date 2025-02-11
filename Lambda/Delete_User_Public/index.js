import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'; 
import dotenv from ' dotenv'; 

dotenv.config(); 

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION }); 

export const handler = async (event) => {

    try {
    if(event.method !== 'DELETE') {
        return {
            statusCode: 405, 
            body: JSON.stringify({ message: 'Only DELETE method allowed!'})
        }
    }

    const { username, user_id } = JSON.parse(event.body); 

    if(!username || !user_id) {
        return {
            statusCode: 400, 
            body: JSON.stringify({ message: 'username and user_id required!'})
        }
    }

    await cognitoClient.send(new AdminDeleteUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID, 
        Username: username
    }))

    const params = {
        FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
        InvocationType: 'RequestResponse', 
        Payload: JSON.stringify(user_id)
    }

    const command = new InvokeCommand(params); 
    const response = await lambdaClient.send(command); 

    if(response.StatusCode !== 200 ) {
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Private Lambda Error!', reponse: response.Payload})        }
    }
    } catch(error) {
        console.error('Error deleting user from Cognito!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error deleting user from Cognito!', error: error.message})
        }
    }
}