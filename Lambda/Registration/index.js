import { CognitoIdentityProviderClient, ConfirmSignUpCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
const lambdaClient = new LambdaClient({ region: process.env.REGION });

function generateSecretHash(username, clientId, clientSecret) {
    return crypto
        .createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}

export const handler = async (event) => {
    try {
        console.log("📌 Received Event:", JSON.stringify(event, null, 2));
        const { action, username, email, password, confirmation_code } = JSON.parse(event.body);

        if (!action || !username) {
            return { statusCode: 400, body: JSON.stringify({ message: "Action and Username are required!" }) };
        }

        if (action === 'register') {
            console.log("📌 Registering user in Cognito...");
            await cognitoClient.send(new SignUpCommand({
                ClientId: process.env.COGNITO_CLIENT_ID, 
                Username: username,
                Password: password, 
                SecretHash: generateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET),  
                UserAttributes: [{ Name: 'email', Value: email }]
            }));

            console.log("✅ Cognito registration successful.");

            console.log("📌 Invoking Private Lambda to store user in RDS...");
            const params = {
                FunctionName: process.env.PRIVATE_LAMBDA_ARN, // Private Lambda ARN
                InvocationType: "RequestResponse",
                Payload: JSON.stringify({ action: "storeUser", username, email })
            };

            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);

            console.log("✅ Private Lambda Response:", response.Payload);

            return {
                statusCode: 201, 
                body: JSON.stringify({ message: "User Registration Successful! Check your email for verification code." })
            };

        } else if (action === 'verify') {
            console.log("📌 Verifying user in Cognito...");
            await cognitoClient.send(new ConfirmSignUpCommand({
                ClientId: process.env.COGNITO_CLIENT_ID, 
                Username: username, 
                ConfirmationCode: confirmation_code
            }));

            console.log("✅ User verified in Cognito.");

            return {
                statusCode: 200, 
                body: JSON.stringify({ message: "User Verified Successfully!" })
            };

        } else {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid Action. Use 'register' or 'verify'!" }) };
        }

    } catch (error) {
        console.error("❌ Error:", error);
        return {
            statusCode: 500, 
            body: JSON.stringify({ message: "Error Processing Request", error: error.message })
        };
    }
};

