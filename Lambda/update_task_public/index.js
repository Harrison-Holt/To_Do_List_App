import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 

export const handler = async (event) => {

    try {

        if(event.method !== 'PUT') {
            return {
                statusCode: 405, 
                body: JSON.stringify({ message: 'Only PUT method allowed!'})
            }
        }

        const { user_id, task_name, task_date, task_time, task_priority } = JSON.parse(event.body); 

        if(!user_id || !task_name || !task_date || !task_time || !task_priority) {
            return {
                statusCode: 400, 
                body: JSON.stringify({ message: 'user_id, task_name, task_date, task_time, task_priority are required!'})
            }
        }
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
            InvocationType: 'RequestResponse', 
            Playload: JSON.stringify(user_id, task_name, task_date, task_time, task_priority)
        }

        const command = new InvokeCommand(params); 
        const response = await lambdaClient.send(command); 

        if(response.StatusCode !== 200) {
            console.error('Private Lambda Error!', response); 
            return {
                statusCode: 500, 
                body: JSON.stringify({ message: 'Private Lambda Error!', error: response.Payload})
            }
        }

        return {
            statusCode: 200, 
            body: JSON.stringify({ message: 'Successfully sent data to private lambda!'})
        }
    } catch(error) {
        console.error('Failed sending to private lambda!'); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Failed sending to private lambda!'})
        }
    }
}