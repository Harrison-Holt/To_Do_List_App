import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const lambdaClient = new LambdaClient({ region: process.env.REGION }); 

export const handler = async (event) => {
    try {
        if (event.httpMethod !== 'PUT') {
            return {
                statusCode: 405,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({ message: 'Only PUT method allowed!' })
            };
        }

        const { user_id, task_id, task_name, task_date, task_time, task_priority } = JSON.parse(event.body);

        if (!user_id || !task_id || !task_name || !task_date || !task_time || !task_priority) {
            return {
                statusCode: 400, 
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({ message: 'user_id, task_id, task_name, task_date, task_time, task_priority are required!' })
            };
        }
        
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN, 
            InvocationType: 'RequestResponse', 
            Payload: JSON.stringify({ user_id, task_id, task_name, task_date, task_time, task_priority })
        };

        const command = new InvokeCommand(params); 
        const response = await lambdaClient.send(command); 

        const rawResponse = new TextDecoder().decode(response.Payload);
        const responseBody = JSON.parse(rawResponse);
        const parsedBody = JSON.parse(responseBody.body); 
         
        if (response.StatusCode !== 200 || responseBody.statusCode !== 200) {
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({ 
                    message: "Private Lambda failed!", 
                    error: parsedBody
                })
            };
        }

        return {
            statusCode: 200, 
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: JSON.stringify({ 
                message: 'Successfully sent data to private lambda!',
                privateLambdaResponse: responseBody 
            })
        };
        
    } catch (error) {
        console.error('Failed sending to private lambda!', error); 
        return {
            statusCode: 500, 
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, PUT, GET, POST, DELETE",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: JSON.stringify({ message: 'Failed sending to private lambda!', error: error.message })
        };
    }
};
