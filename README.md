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

   #### Creating a MySQL DB Instance (Standard Create)
   1. Sign in to the AWS Management Console and open the [Amazon RDS console](https://console.aws.amazon.com/rds/)
   2. In the navigation pane, choose **Databases**, then click **Create database**
   3. Select **Standard create** method
   4. Choose **MySQL** as the engine type
   5. Select the MySQL version (recommend MySQL 8.0 or later)
   6. Under **Templates**, choose **Free tier** for development or **Production** for production use
   7. Configure settings:
      - **DB instance identifier**: Enter a name for your database (e.g., `khoclinic-db`)
      - **Master username**: Create a username (e.g., `admin`)
      - **Master password**: Create a strong password and note it down
   8. Under **Instance configuration**:
      - For development: Select **Burstable classes** (t2.micro or t3.micro)
      - For production: Choose appropriate instance size based on your needs
   9. Under **Storage**:
      - Set appropriate storage size (start with 20GB for development)
      - Enable storage autoscaling for production environments
   10. Under **Connectivity**:
       - **Virtual Private Cloud (VPC)**: Choose your VPC
       - **Subnet group**: Choose default or create a new one
       - **Public access**: Select **Yes** for development (easier to connect) or **No** for production (more secure)
       - **VPC security group**: Create new or select existing
       - **Availability Zone**: No preference or choose specific zone
   11. Under **Additional configuration**:
       - **Initial database name**: Enter `khoclinic` (must match DB_NAME in your .env)
       - **DB parameter group**: Default
       - **Option group**: Default
       - **Enable automatic backups**: Recommended for production
       - **Encryption**: Enable for production environments
   12. Click **Create database**

   #### Configuring Security Group for RDS Access
   1. Go to the EC2 Dashboard > **Security Groups**
   2. Find the security group associated with your RDS instance
   3. Edit inbound rules:
      - Add a rule: Type **MySQL/Aurora (3306)**, Source: Custom IP (your Amplify app's IP) or temporarily use **0.0.0.0/0** for testing (not recommended for production)
   4. Save rules

   #### Connecting Your Application to RDS
   1. Once your RDS instance is available, note the **Endpoint** from the Connectivity & Security tab
   2. Update your environment variables in AWS Amplify Console:
      ```
      DB_HOST=your-db-instance.xxxxxxxxxx.region.rds.amazonaws.com
      DB_USER=admin
      DB_PASSWORD=your-password
      DB_NAME=khoclinic
      ```
   3. Test the connection before deploying

2. **Storage**: Set up Amazon S3 bucket for file uploads (optional)
   
   #### Creating an S3 Bucket for Small-Scale Production
   1. Sign in to the AWS Management Console and open the [Amazon S3 console](https://console.aws.amazon.com/s3/)
   2. Choose **Create bucket**
   3. Configure bucket:
      - **Bucket name**: Enter a globally unique name (e.g., `khoclinic-files`)
      - **AWS Region**: Choose the same region as your RDS and Amplify app for lower latency
      - **Object Ownership**: Select **ACLs disabled** (recommended)
      - **Block Public Access settings**: Keep all blocks enabled for security
      - **Bucket Versioning**: Enable for critical files (allows recovery of overwritten files)
      - **Default encryption**: Enable with Amazon S3 managed keys (SSE-S3)
      - **Advanced settings**: Leave as default for now
   4. Click **Create bucket**

   #### Configure CORS for Your S3 Bucket
   1. Select your newly created bucket
   2. Go to the **Permissions** tab
   3. Scroll down to **Cross-origin resource sharing (CORS)**
   4. Click **Edit** and add a CORS configuration:
      ```json
      [
        {
          "AllowedHeaders": ["*"],
          "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
          "AllowedOrigins": ["https://your-amplify-app-domain.amplifyapp.com"],
          "ExposeHeaders": []
        }
      ]
      ```
      (Replace the domain with your actual Amplify app domain)
   5. Click **Save changes**

   #### Setting Up IAM Permissions for S3 Access
   1. Go to the IAM console
   2. Create a new policy:
      - Service: S3
      - Actions: 
         - For read-only: GetObject, ListBucket
         - For read-write: GetObject, PutObject, DeleteObject, ListBucket
      - Resources: 
         - Bucket: arn:aws:s3:::khoclinic-files
         - Object: arn:aws:s3:::khoclinic-files/*
   3. Create a new IAM user or role and attach this policy
   4. Generate access keys if using IAM user approach

   #### Connecting Your Application to S3
   1. Install AWS SDK in your server:
      ```
      npm install aws-sdk
      ```
   2. Add S3 configuration to your environment variables in AWS Amplify Console:
      ```
      S3_BUCKET_NAME=khoclinic-files
      AWS_REGION=your-region
      ```
   3. If using IAM user (not recommended for production):
      ```
      AWS_ACCESS_KEY_ID=your-access-key
      AWS_SECRET_ACCESS_KEY=your-secret-key
      ```
   4. For production, use IAM roles instead of access keys

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