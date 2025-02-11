import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from 'dotenv'; 

dotenv.config()

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 

export const handler = async (event) => {

    try {

        const { task_id, user_id } = JSON.parse(event.body); 

        if(!task_id) {
            return {
                statusCode: 400, 
                body: JSON.stringify({ message: 'Task ID is required!'})
            }
        }

        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
            InvocationType: 'Event', 
            Payload: JSON.stringify({ task_id, user_id })
        }

        const command = new InvokeCommand(params); 
        const response = await lambdaClient.send(command); 

        console.log("Private Lambda Response", response.Payload); 

        return {
            statusCode: 201, 
            body: JSON.stringify({ message: 'Sucessfully send data to private lambda!'}) 
        }

    } catch(error) {
        console.error('Error sending to private lambda!', error); 
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: 'Error sending to private lambda!'})
        }
    }
}