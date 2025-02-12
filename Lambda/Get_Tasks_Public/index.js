import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda";
import dotenv from 'dotenv'; 

dotenv.config(); 

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 

export const handler = async (event) => {

    try {

        if(event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Only GET method is allowed!'})
            }
        } 

        const { user_id } = JSON.parse(event.body); 

        if( !user_id ) {
            return {
                statusCode: 400, 
                body: JSON.stringify({ message: 'User ID are required!'})
            }
        }

        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
            InvocationType: 'RequestResponse', 
            Payload: JSON.stringify({user_id})
        }

        const command = new InvokeCommand(params); 
        const response = await lambdaClient.send(command); 

        if(response.StatusCode !== 200) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error sending to private lambda!', response: response.Payload})
            }
        } else {
        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Successfully sent to private lambda', response: response.Payload})
        }
    }
    } catch(error) {
        console.error('Error sending to private lambda!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error sending to private lambda!', error: error.message})
        }
    }
}