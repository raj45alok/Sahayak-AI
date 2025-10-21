import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')
submissions_table = dynamodb.Table('Submissions-dev')
doubts_table = dynamodb.Table('DoubtQueue')

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
        
        # FIXED: Get user with BOTH partition key (userId) and sort key (role)
        user_response = users_table.get_item(
            Key={
                'userId': user_id,
                'role': 'student'
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
                    'error': 'Student not found'
                })
            }
        
        user = user_response['Item']
        
        # Get submissions stats
        try:
            submissions_response = submissions_table.query(
                IndexName='StudentId-index',
                KeyConditionExpression=Key('student_id').eq(user_id)
            )
            submissions = submissions_response.get('Items', [])
        except Exception as e:
            print(f"Submissions query error: {e}")
            submissions = []
        
        completed = [s for s in submissions if s.get('evaluation_status') == 'completed']
        total_submissions = len(submissions)
        avg_score = 0
        if completed:
            scores = [s.get('final_score', 0) for s in completed if s.get('final_score')]
            avg_score = round(sum(scores) / len(scores)) if scores else 0
        
        # Get doubts stats
        try:
            doubts_response = doubts_table.query(
                IndexName='StudentId-index',
                KeyConditionExpression=Key('studentId').eq(user_id)
            )
            doubts = doubts_response.get('Items', [])
        except Exception as e:
            print(f"Doubts query error: {e}")
            doubts = []
        
        total_doubts = len(doubts)
        answered_doubts = len([d for d in doubts if d.get('status') in ['answered', 'resolved']])
        
        sorted_doubts = sorted(doubts, key=lambda x: x.get('createdAt', ''), reverse=True)
        recent_doubts = sorted_doubts[:5]
        
        # Build response
        profile_data = {
            'userId': user.get('userId'),
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'phone': user.get('phone', ''),
            'classId': user.get('classId', ''),
            'role': user.get('role'),
            'createdAt': user.get('createdAt', ''),
            'firebaseUid': user.get('firebaseUid', ''),
            
            'stats': {
                'assignmentsCompleted': len(completed),
                'assignmentsSubmitted': total_submissions,
                'averageScore': avg_score,
                'totalDoubts': total_doubts,
                'answeredDoubts': answered_doubts,
                'currentGradeAverage': 'B+',
                'subjectsEnrolled': 6,
                'daysStreak': 12
            },
            
            'parentEmail': user.get('parentEmail', ''),
            'parentPhone': user.get('parentPhone', ''),
            'bio': 'I love learning new things, especially mathematics!',
            'interests': ['Mathematics', 'Science', 'Reading'],
            'learningGoals': 'Improve in algebra and geometry',
            
            'recentDoubts': [
                {
                    'doubtId': d.get('doubtId'),
                    'question': d.get('question'),
                    'status': d.get('status'),
                    'createdAt': d.get('createdAt'),
                    'subject': d.get('subject', 'general')
                }
                for d in recent_doubts
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
