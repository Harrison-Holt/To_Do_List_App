import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

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
                    "Access-Control-Allow-Methods": "OPTIONS, GET",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: ""
            };
        }

        // ✅ Ensure only GET requests are allowed
        if (event.httpMethod !== "GET") {
            return {
                statusCode: 405,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Only GET method is allowed!" }),
            };
        }

        // ✅ Extract user_id from query parameters
        const user_id = event.queryStringParameters?.user_id;

        // ✅ Validate user_id parameter
        if (!user_id) {
            console.error("❌ Missing user_id in query parameters!");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "User ID is required as a query parameter!" }),
            };
        }

        console.log("🔹 Fetching tasks for user:", user_id);

        // ✅ Invoke Private Lambda to Retrieve Tasks
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({ user_id }),
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        console.log("✅ Private Lambda Invoked for Task Retrieval!");

        // ✅ Parse the response from the private Lambda
        const rawPayload = new TextDecoder().decode(response.Payload);
        const parsedPayload = JSON.parse(rawPayload);
        const parsedBody = JSON.parse(parsedPayload.body);

        // ✅ Handle errors from private Lambda
        if (parsedPayload.statusCode !== 200) {
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    message: "Error retrieving tasks from private Lambda!",
                    error: parsedBody,
                }),
            };
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "Successfully retrieved user tasks!",
                tasks: parsedBody.tasks || [],
            }),
        };

    } catch (error) {
        console.error("❌ Error retrieving tasks:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Internal Server Error!", error: error.message }),
        };
    }
};
