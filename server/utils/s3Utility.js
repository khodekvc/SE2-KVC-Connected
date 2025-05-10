// S3 Utility for file uploads and downloads
const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  // For local development, you might need these
  // For production with Amplify, use IAM roles instead
  ...(process.env.AWS_ACCESS_KEY_ID && {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
});

// Create S3 service object
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'khoclinic-files';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {String} fileName - The name to save the file as
 * @param {String} fileType - The mime type of the file
 * @param {String} folder - The folder path within the bucket
 * @returns {Promise} - Promise with S3 upload result
 */
const uploadFile = async (fileBuffer, fileName, fileType, folder = '') => {
  // Create folder path if it doesn't exist with trailing slash
  const key = folder ? `${folder.replace(/\/$/, '')}/${fileName}` : fileName;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: fileType,
    // Optional: Set metadata
    Metadata: {
      'upload-date': new Date().toISOString()
    }
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`File uploaded successfully at ${result.Location}`);
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Generate a signed URL for temporary access to a file
 * @param {String} key - The S3 object key
 * @param {Number} expirySeconds - Seconds until URL expiration (default: 3600 = 1 hour)
 * @returns {String} - Signed URL
 */
const getSignedUrl = (key, expirySeconds = 3600) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expirySeconds
  };

  try {
    const url = s3.getSignedUrl('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {String} key - The S3 object key
 * @returns {Promise} - Promise with S3 delete result
 */
const deleteFile = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const result = await s3.deleteObject(params).promise();
    console.log(`File deleted successfully: ${key}`);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * List files in a folder
 * @param {String} prefix - The folder path/prefix
 * @returns {Promise} - Promise with array of objects
 */
const listFiles = async (prefix = '') => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  getSignedUrl,
  deleteFile,
  listFiles
};