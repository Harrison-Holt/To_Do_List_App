import dotenv from 'dotenv'
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda'

dotenv.config()

const lambdaClient = new LambdaClient({ region: process.env.REGION})

export const handler = async (event) => {

    try {
    const { user_id, task_name, task_date, task_time, task_priority, task_completed } = JSON.parse(event.body)

    if(!user_id || !task_name || !task_date || !task_time || !task_priority || !task_completed) {
        return {
            statusCode: 400, 
            body: JSON.stringify({ message: 'user_id, task_name, task_date, task_time, task_priority, task_completed are required!'})
        }
    }

    const params = {
        FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
        InvocationType: "RequestResponse", 
        Payload: JSON.stringify({user_id, task_name, task_date, task_time, task_priority, task_completed})
    }

    const command = new InvokeCommand(params)
    const response = await lambdaClient.send(command)

    console.log("Private Lambda Response: ", response.Payload)

    return {
        statusCode: 200, 
        body: JSON.stringify({ message: "Successfully sending data to private lambda!"})
    }

    } catch(error) {
        console.error("Error sending data to private lambda", error)
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: "Error sending data to private lambda!"})
        }
    }
}
