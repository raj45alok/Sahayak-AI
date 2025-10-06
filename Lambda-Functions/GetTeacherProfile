import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')
content_table = dynamodb.Table('sahayak-content')
assignments_table = dynamodb.Table('Assignments-dev')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def lambda_handler(event, context):
    try:
        # Get userId from query string
        user_id = None
        if event.get('queryStringParameters'):
            user_id = event['queryStringParameters'].get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'userId is required'
                })
            }
        
        # Get user with both partition and sort key
        user_response = users_table.get_item(
            Key={
                'userId': user_id,
                'role': 'teacher'
            }
        )
        
        if 'Item' not in user_response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Teacher not found'
                })
            }
        
        user = user_response['Item']
        
        # Get content statistics using teacherId-index GSI
        try:
            content_response = content_table.query(
                IndexName='teacherId-index',
                KeyConditionExpression=Key('teacherId').eq(user_id)
            )
            content_items = content_response.get('Items', [])
        except Exception as e:
            print(f"Content query error: {e}")
            content_items = []
        
        # Count only MASTER entries (not individual parts)
        master_content = [c for c in content_items if c.get('partNumber') == 'MASTER']
        total_content = len(master_content)
        
        # Count by status
        scheduled_content = len([c for c in master_content if c.get('status') == 'scheduled'])
        delivered_content = len([c for c in master_content if c.get('status') == 'delivered'])
        
        # Get assignment statistics
        try:
            assignments_response = assignments_table.scan(
                FilterExpression='teacher_id = :tid',
                ExpressionAttributeValues={
                    ':tid': user_id
                }
            )
            assignments = assignments_response.get('Items', [])
        except Exception as e:
            print(f"Assignments query error: {e}")
            assignments = []
        
        total_assignments = len(assignments)
        
        # Get recent content (last 5)
        sorted_content = sorted(master_content, key=lambda x: x.get('createdAt', ''), reverse=True)
        recent_content = sorted_content[:5]
        
        # Get recent assignments (last 5)
        sorted_assignments = sorted(assignments, key=lambda x: x.get('created_at', ''), reverse=True)
        recent_assignments = sorted_assignments[:5]
        
        # Build response
        profile_data = {
            'userId': user.get('userId'),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'phone': user.get('phone', ''),
            'role': user.get('role'),
            'createdAt': user.get('createdAt', ''),
            'firebaseUid': user.get('firebaseUid', ''),
            'subjectSpecialization': user.get('subjectSpecialization', []),
            
            'stats': {
                'totalContent': total_content,
                'scheduledContent': scheduled_content,
                'deliveredContent': delivered_content,
                'totalAssignments': total_assignments,
                'studentsTaught': '150+',
                'yearsExperience': '12'
            },
            
            # Static defaults (not in DB yet)
            'classInfo': user.get('classInfo', 'Grade 6-8'),
            'bio': 'Passionate educator with 10+ years of experience in mathematics education. Focused on making complex concepts simple and engaging for students.',
            'qualification': 'M.Ed in Mathematics, B.Sc in Mathematics',
            'experience': '12 years',
            
            # Recent activity
            'recentContent': [
                {
                    'contentId': c.get('contentId'),
                    'subject': c.get('subject'),
                    'classId': c.get('classId'),
                    'status': c.get('status'),
                    'createdAt': c.get('createdAt'),
                    'totalParts': c.get('totalParts', 0)
                }
                for c in recent_content
            ],
            
            'recentAssignments': [
                {
                    'assignmentId': a.get('assignment_id'),
                    'title': a.get('title', 'Untitled'),
                    'subject': a.get('subject'),
                    'status': a.get('status'),
                    'createdAt': a.get('created_at'),
                    'dueDate': a.get('due_date')
                }
                for a in recent_assignments
            ]
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': profile_data
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
