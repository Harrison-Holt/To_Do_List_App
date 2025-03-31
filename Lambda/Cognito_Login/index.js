import { CognitoIdentityProviderClient, InitiateAuthCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

dotenv.config();

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

function generateSecretHash(username, clientId, clientSecret) {
    return crypto
        .createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}

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
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: ""
            };
        }

        // ✅ Ensure only POST requests are allowed
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Method Not Allowed" })
            };
        }

        // ✅ Parse the request body safely
        const { username, password } = JSON.parse(event.body);

        // ✅ Basic Input Validation
        if (!username || !password) {
            console.log("❌ Missing required fields: username or password");
            return { 
                statusCode: 400, 
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Username and Password are required!" }) 
            };
        }

        console.log("🔹 Authenticating user:", username);

        // ✅ Authenticate with Cognito
        const authParams = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
                SECRET_HASH: generateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET)
            }
        };

        const authResponse = await cognitoClient.send(new InitiateAuthCommand(authParams));

        console.log("✅ Authentication successful for user:", username);

        // ✅ Extract ID Token and Decode to get User ID (sub)
        const idToken = authResponse.AuthenticationResult.IdToken;
        const decodedToken = jwt.decode(idToken); // Decode JWT
        const user_id = decodedToken.sub; // Extract Cognito sub (user ID)

        console.log("✅ Extracted User ID:", user_id);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "Login Successful!",
                user_id, // ✅ Return Cognito user ID
                idToken: authResponse.AuthenticationResult.IdToken,
                accessToken: authResponse.AuthenticationResult.AccessToken,
                refreshToken: authResponse.AuthenticationResult.RefreshToken
            })
        };

    } catch (error) {
        console.error("❌ Login Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Error Logging In", error: error.message })
        };
    }
};

