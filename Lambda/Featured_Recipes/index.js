import dotenv from 'dotenv'

dotenv.config()

export const handler = async () => {

    const api_key = process.env.API_KEY 

    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=inspirational', {
            headers: {
                'X-API-KEY': api_key
            }
        })

        const data = await response.json()
        console.log(data)
    } catch(error) {
        console.error('Error fetching quote!', error)
    }
}