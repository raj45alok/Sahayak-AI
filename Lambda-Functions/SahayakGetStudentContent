import json
import boto3
from decimal import Decimal
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')
content_table = dynamodb.Table('sahayak-content')

BUCKET_NAME = 'sahayak-study-content'

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Fetch delivered content for student's class
    Returns ONLY the parts that were delivered on the requested date
    """
    
    # Handle OPTIONS for CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event['body']) if 'body' in event else event
        
        class_id = body.get('classId')
        subject_filter = body.get('subject')
        today_only = body.get('todayOnly', False)
        
        if not class_id:
            raise Exception("classId is required")
        
        print(f"Fetching content for class: {class_id}, subject: {subject_filter or 'all'}, todayOnly: {today_only}")
        
        # Query by status index to get delivered content
        response = content_table.query(
            IndexName='status-scheduleDate-index',
            KeyConditionExpression='#status = :delivered',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':delivered': 'delivered'}
        )
        
        items = response.get('Items', [])
        
        # Get today's date for filtering
        today = datetime.utcnow().date().isoformat() if today_only else None
        
        filtered_content = []
        processed_parts = set()  # Track contentId_partNumber to avoid duplicates
        
        for item in items:
            # Skip MASTER records
            if item.get('partNumber') == 'MASTER':
                continue
            
            content_id = item['contentId']
            part_number = item['partNumber']
            
            # Create unique key for this specific part
            part_key = f"{content_id}_{part_number}"
            
            # Skip if already processed
            if part_key in processed_parts:
                continue
            
            # Get master record
            try:
                master_response = content_table.get_item(
                    Key={
                        'contentId': content_id,
                        'partNumber': 'MASTER'
                    }
                )
                
                if 'Item' not in master_response:
                    continue
                
                master = master_response['Item']
                
                # Filter by classId
                if master.get('classId') != class_id:
                    continue
                
                # Filter by subject if specified
                if subject_filter and master.get('subject') != subject_filter:
                    continue
                
                # CRITICAL: Check if THIS SPECIFIC PART was delivered today
                part_delivery = item.get('deliveredAt', item.get('scheduleDate', ''))
                if today_only and part_delivery:
                    delivery_day = part_delivery.split('T')[0] if 'T' in part_delivery else part_delivery
                    if delivery_day != today:
                        continue  # Skip this part - not delivered today
                
                # Generate download URL
                download_url = None
                s3_key = master.get('s3Key')
                if s3_key:
                    try:
                        download_url = s3_client.generate_presigned_url(
                            'get_object',
                            Params={
                                'Bucket': BUCKET_NAME,
                                'Key': s3_key
                            },
                            ExpiresIn=3600
                        )
                    except Exception as url_error:
                        print(f"Error generating download URL: {str(url_error)}")
                
                # Return ONLY this specific part (not all parts)
                filtered_content.append({
                    'contentId': content_id,
                    'subject': master.get('subject', ''),
                    'topicName': master.get('textContent', '')[:100] if master.get('textContent') else '',
                    'totalParts': 1,  # Only this one part
                    'currentPart': part_number,  # Which part this is (PART-1, PART-2, etc)
                    'parts': [{
                        'partNumber': part_number,
                        'summary': item.get('summary', ''),
                        'enhancedContent': item.get('enhancedContent', ''),
                        'videoLinks': item.get('videoLinks', []),
                        'practiceQuestions': item.get('practiceQuestions', []),
                        'hasDiagrams': item.get('hasDiagrams', False),
                        'estimatedStudyTime': item.get('estimatedStudyTime', 45),
                        'contentAnalysis': item.get('contentAnalysis', {})
                    }],
                    'language': master.get('language', 'hindi'),
                    'deliveredAt': part_delivery,
                    'downloadUrl': download_url,
                    'originalFileName': master.get('originalFileName', 'document.pdf'),
                    's3Key': s3_key,
                    'teacherId': master.get('teacherId', '')
                })
                
                processed_parts.add(part_key)
                
            except Exception as item_error:
                print(f"Error processing part {part_key}: {str(item_error)}")
                import traceback
                traceback.print_exc()
                continue
        
        # Sort by delivery date (most recent first)
        filtered_content.sort(
            key=lambda x: x.get('deliveredAt', ''),
            reverse=True
        )
        
        print(f"Found {len(filtered_content)} delivered parts for class {class_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'classId': class_id,
                'subject': subject_filter,
                'todayOnly': today_only,
                'contentCount': len(filtered_content),
                'content': filtered_content
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error fetching student content: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to fetch content'
            })
        }
