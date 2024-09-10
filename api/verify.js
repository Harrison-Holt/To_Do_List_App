import dotenv from 'dotenv'; 
import jwt from 'jsonwebtoken'; 

dotenv.config(); 

export function verify_token(req, res, next) {

    const authHeader = req.header['authorization']; 
    const token = authHeader && authHeader.split(' ')[1]; 
    
    
    if(!token) {
        return res.status(401).json({ message: 'Access token required!'}); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            return res.status(403).json({ message: 'Invalid Token or Expired Token'}); 
        }
        req.user = user; 
        next(); 
    })
}