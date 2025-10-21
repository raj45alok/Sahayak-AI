import json
import boto3
import uuid
from datetime import datetime

# Initialize S3 client
s3_client = boto3.client('s3', region_name='us-east-1')

# Configuration
BUCKET_NAME = 'sahayak-study-content'
ALLOWED_CONTENT_TYPES = ['application/pdf']
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB limit

def lambda_handler(event, context):
    """
    Generate pre-signed URL for direct S3 upload
    
    Expected input:
    {
        "teacherId": "TCH-001",
        "fileName": "chapter10.pdf",
        "fileSize": 5242880  // Optional: file size in bytes for validation
    }
    
    Returns:
    {
        "uploadUrl": "https://s3.amazonaws.com/...",
        "contentId": "CNT-abc123",
        "s3Key": "uploads/CNT-abc123/original.pdf",
        "expiresIn": 300
    }
    """
    
    try:
        # Parse input
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
        
        teacher_id = body.get('teacherId')
        file_name = body.get('fileName', 'document.pdf')
        file_size = body.get('fileSize', 0)
        
        # Validate inputs
        if not teacher_id:
            raise Exception("teacherId is required")
        
        # Validate file type
        if not file_name.lower().endswith('.pdf'):
            raise Exception("Only PDF files are supported")
        
        # Validate file size (optional)
        if file_size > MAX_FILE_SIZE:
            raise Exception(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024)} MB")
        
        # Generate unique content ID
        content_id = f"CNT-{uuid.uuid4().hex[:8]}"
        timestamp = datetime.utcnow().isoformat()
        
        # Create S3 key with proper structure
        s3_key = f"uploads/{content_id}/original.pdf"
        
        print(f"Generating pre-signed URL for {teacher_id}: {s3_key}")
        
        # Generate pre-signed URL for PUT operation
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': s3_key,
                'ContentType': 'application/pdf',
                'Metadata': {
                    'teacherId': teacher_id,
                    'contentId': content_id,
                    'uploadedAt': timestamp,
                    'originalFileName': file_name
                }
            },
            ExpiresIn=300  # URL expires in 5 minutes
        )
        
        print(f"Pre-signed URL generated successfully for {content_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'uploadUrl': presigned_url,
                'contentId': content_id,
                's3Key': s3_key,
                'expiresIn': 300,
                'uploadMethod': 'PUT',
                'contentType': 'application/pdf',
                'message': 'Upload URL generated successfully'
            })
        }
        
    except Exception as e:
        print(f"Error generating pre-signed URL: {str(e)}")
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to generate upload URL'
            })
        }
