import { Buffer } from 'buffer';

// Create a mock JWT with the expected structure
// JWT format: header.payload.signature (all base64 encoded)

const header = {
  "alg": "RS256",
  "typ": "JWT"
};

const payload = {
  "user_id": "firebase-uid-12345",  // This is what the API looks for
  "sub": "firebase-uid-12345",      // Fallback
  "email": "test@megalabs.com",
  "iat": Math.floor(Date.now() / 1000),
  "exp": Math.floor(Date.now() / 1000) + 3600,
  "aud": "megalabs-webapp",
  "iss": "https://securetoken.google.com/megalabs-webapp"
};

const signature = "fake-signature";

// Base64 encode each part
const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const encodedSignature = Buffer.from(signature).toString('base64url');

const mockJWT = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

console.log('🔑 Mock JWT Token:');
console.log(mockJWT);
console.log('\\n📋 Use this token for testing:');
console.log(`Authorization: Bearer ${mockJWT}`);