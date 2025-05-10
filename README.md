# KHO Veterinary Clinic Application

## Deployment Guide for AWS Amplify

### Prerequisites
- AWS Account
- Git repository (GitHub, GitLab, BitBucket, or AWS CodeCommit)
- AWS Amplify CLI (optional for local development)

### Step 1: Prepare Your Repository
1. Make sure your code is committed to a Git repository
2. Ensure all environment variables are properly configured
3. Verify the amplify.yml file is in the root directory

### Step 2: Set Up AWS Services
1. **Database**: Create an Amazon RDS MySQL instance
   - Note the endpoint, username, password, and database name
   - Configure security groups to allow access from Amplify

2. **Storage**: Set up Amazon S3 bucket for file uploads (optional)
   - Configure CORS settings for your domain

### Step 3: Deploy with AWS Amplify
1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Choose "New app" > "Host web app"
4. Connect to your Git provider and select your repository
5. Configure build settings:
   - Verify the amplify.yml file is detected
   - Add environment variables in the Amplify Console:
     - All variables from .env.example files

6. Deploy your application

### Step 4: Configure Environment Variables
In the Amplify Console, add all required environment variables:
- Database credentials
- JWT secrets
- Email configuration
- API endpoints
- Other application secrets

### Step 5: Set Up Custom Domain (Optional)
1. In the Amplify Console, go to "Domain Management"
2. Add your custom domain and follow the verification steps

### Troubleshooting
- Check CloudWatch Logs for any deployment or runtime errors
- Verify environment variables are correctly set
- Ensure database connectivity from the deployed application

## Local Development
1. Clone the repository
2. Create .env files based on the .env.example templates
3. Install dependencies:
   ```
   cd client && npm install
   cd ../server && npm install
   ```
4. Start the development servers:
   ```
   # Terminal 1
   cd client && npm run dev
   
   # Terminal 2
   cd server && npm run dev
   ```