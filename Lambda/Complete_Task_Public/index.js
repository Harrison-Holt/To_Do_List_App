import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda";
import dotenv from 'dotenv'; 

dotenv.config(); 

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 

export const handler = async (event) => {

    try {

        const { task_id, user_id } = JSON.parse(event.body); 

        if( !task_id || !user_id ) {
            return {
                statusCode: 400, 
                body: JSON.stringify({ message: 'Task ID and User ID are required!'})
            }
        }

        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
            InvocationType: 'Event', 
            Payload: JSON.stringify(task_id, user_id)
        }

        const command = new InvokeCommand(params); 
        const reponse = await lambdaClient.send(command); 

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Successfully sent to private lambda', response: response.Payload})
        }
    } catch(error) {
        console.error('Error sending to private lambda!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error sending to private lambda!', error: error.message})
        }
    }
}