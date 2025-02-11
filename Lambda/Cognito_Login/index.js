import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
        if (event.method !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "Method Not Allowed" })
            };
        }

        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ message: "Username and Password are required!" }) 
            };
        }

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

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login Successful!",
                idToken: authResponse.AuthenticationResult.IdToken,
                accessToken: authResponse.AuthenticationResult.AccessToken,
                refreshToken: authResponse.AuthenticationResult.RefreshToken
            })
        };

    } catch (error) {
        console.error("Login Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error Logging In", error: error.message })
        };
    }
};
