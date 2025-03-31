import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import dotenv from 'dotenv';

dotenv.config();

const lambdaClient = new LambdaClient({ region: process.env.REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler = async (event) => {
    console.log("🔹 Incoming Request:", event);

    // ✅ Handle Preflight Requests (CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: "✅ Preflight check passed!" })
        };
    }

    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: 'Only DELETE method allowed!' })
        };
    }

    try {
        const { username, user_id } = JSON.parse(event.body);
        console.log("🔹 Received DELETE request for:", { username, user_id, type: typeof user_id });

        if (!username || !user_id) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                body: JSON.stringify({ message: 'username and user_id required!' })
            };
        }

        // ✅ Step 1: Check if user exists in Cognito before deleting
        try {
            await cognitoClient.send(new AdminDeleteUserCommand({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: username
            }));
            console.log("✅ Successfully deleted from Cognito.");
        } catch (err) {
            if (err.name === "UserNotFoundException") {
                console.error("❌ User does not exist in Cognito.");
                return {
                    statusCode: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                    body: JSON.stringify({ message: "User does not exist in Cognito." })
                };
            }
            throw err;
        }

        // ✅ Step 2: Call Private Lambda to delete from MySQL
        console.log("🔹 Sending user_id to private Lambda:", user_id);
        const params = {
            FunctionName: process.env.PRIVATE_LAMBDA_ARN,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ user_id })  
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        // ✅ Decode and parse the response
        const rawResponse = new TextDecoder().decode(response.Payload);
        console.log("🔹 Raw Private Lambda Response:", rawResponse);

        const responseBody = JSON.parse(rawResponse);
        console.log("🔹 Parsed Private Lambda Response:", responseBody);

        if (responseBody.statusCode !== 200) {
            console.error("❌ Private Lambda Failed:", responseBody);
            return {
                statusCode: responseBody.statusCode || 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                body: JSON.stringify({
                    message: "❌ Private Lambda failed!",
                    error: responseBody.body
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({
                message: "✅ User successfully deleted from Cognito and Database!",
                privateLambdaResponse: responseBody
            })
        };

    } catch (error) {
        console.error("❌ Error deleting user:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: "❌ Error deleting user!", error: error.message })
        };
    }
};
