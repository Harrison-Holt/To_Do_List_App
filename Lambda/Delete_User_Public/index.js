import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

dotenv.config();

const lambdaClient = new LambdaClient({ region: process.env.REGION });

export const handler = async (event) => {
    try {
        console.log("Incoming Event:", JSON.stringify(event, null, 2));

        // ✅ Handle CORS Preflight Requests (OPTIONS Method)
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                body: "",
            };
        }

        // ✅ Ensure only DELETE requests are allowed
        if (event.httpMethod !== "DELETE") {
            return {
                statusCode: 405,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Only DELETE method is allowed!" }),
            };
        }

        // ✅ Parse the request body safely
        const { task_id, user_id } = JSON.parse(event.body);

        // ✅ Validate required fields
        if (!task_id || !user_id) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Task ID and User ID are required!" }),
            };
        }

        console.log("🔹 Sending request to private Lambda:", { task_id, user_id });

        // ✅ Invoke Private Lambda Function
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({ task_id, user_id }),
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        const rawResponse = new TextDecoder().decode(response.Payload);
        const responseBody = JSON.parse(rawResponse);
        const parsedBody = JSON.parse(responseBody.body);

        if (response.StatusCode !== 200 || responseBody.statusCode !== 200) {
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    message: "Private Lambda failed!",
                    error: parsedBody,
                }),
            };
        }

        console.log("✅ Private Lambda execution successful:", parsedBody);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Successfully sent data to private lambda!" }),
        };
    } catch (error) {
        console.error("❌ Error sending to private lambda!", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Error sending to private lambda!", error: error.message }),
        };
    }
};
