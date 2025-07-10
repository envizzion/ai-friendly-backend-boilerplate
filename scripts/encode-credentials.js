import fs from 'fs';
import path from 'path';

const credentialsPath = process.argv[2];
if (!credentialsPath) {
    console.error('Please provide the path to your credentials file');
    process.exit(1);
}

try {
    const credentials = fs.readFileSync(path.resolve(credentialsPath), 'utf8');
    const base64Credentials = Buffer.from(credentials).toString('base64');
    console.log('Add this to your .env file as GOOGLE_CREDENTIALS:');
    console.log(base64Credentials);
} catch (error) {
    console.error('Error reading credentials file:', error);
    process.exit(1);
} 41