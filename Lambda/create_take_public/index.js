import dotenv from "dotenv";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

dotenv.config();

const lambdaClient = new LambdaClient({ region: process.env.REGION });

export const handler = async (event) => {
    try {
        console.log("Incoming event:", JSON.stringify(event, null, 2));

        // ✅ Handle CORS Preflight Requests (OPTIONS Method)
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: ""
            };
        }

        // ✅ Ensure only POST requests are allowed
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Method Not Allowed" }),
            };
        }

        // ✅ Parse request body safely
        const { user_id, task_name, task_date, task_time, task_priority, task_completed } = JSON.parse(event.body);

        // ✅ Basic Input Validation
        if (!user_id || !task_name || !task_date || !task_time || !task_priority || task_completed === undefined) {
            console.error("❌ Missing required fields:", { user_id, task_name, task_date, task_time, task_priority, task_completed });
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "user_id, task_name, task_date, task_time, task_priority, and task_completed are required!" }),
            };
        }

        console.log("🔹 Creating task for user:", user_id);

        // ✅ Invoke Private Lambda for Task Creation
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({ user_id, task_name, task_date, task_time, task_priority, task_completed }),
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        console.log("✅ Task creation Lambda invoked successfully!");

        // ✅ Parse Lambda Response
        const rawResponse = new TextDecoder().decode(response.Payload);
        const responseBody = JSON.parse(rawResponse);
        const parsedBody = JSON.parse(responseBody.body);

        if (response.StatusCode !== 200 || responseBody.statusCode !== 200) {
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ 
                    message: "Private Lambda failed!", 
                    error: parsedBody
                })
            };
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "Task Creation Successful!",
                task_id: parsedBody.task_id
            })
        };

    } catch (error) {
        console.error("❌ Error processing task creation:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Internal Server Error!", error: error.message }),
        };
    }
};
