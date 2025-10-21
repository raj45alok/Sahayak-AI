import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')
content_table = dynamodb.Table('sahayak-content')
assignments_table = dynamodb.Table('Assignments-dev')
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
        
        # Get teacher from Users table
        user_response = users_table.get_item(
            Key={'userId': user_id, 'role': 'teacher'}
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
        subject_specialization = user.get('subjectSpecialization', [])
        
        # 1. Get assignments created by this teacher
        try:
            assignments_response = assignments_table.query(
                IndexName='TeacherAssignments',
                KeyConditionExpression=Key('teacher_id').eq(user_id)
            )
            assignments = assignments_response.get('Items', [])
        except Exception as e:
            print(f"Assignments query error: {e}")
            assignments = []
        
        total_assignments = len(assignments)
        
        # Get unique classes this teacher teaches
        unique_classes = list(set([a.get('class_info', '') for a in assignments if a.get('class_info')]))
        
        # 2. Get content posted by this teacher
        try:
            content_response = content_table.query(
                IndexName='teacherId-index',
                KeyConditionExpression=Key('teacherId').eq(user_id)
            )
            content_items = content_response.get('Items', [])
        except Exception as e:
            print(f"Content query error: {e}")
            content_items = []
        
        # Count only MASTER entries
        master_content = [c for c in content_items if c.get('partNumber') == 'MASTER']
        total_content = len(master_content)
        
        # 3. Calculate total students (40 per class as requested)
        total_students = len(unique_classes) * 40 if unique_classes else 53  # Default 53 if no classes
        
        # 4. Get all submissions for teacher's assignments
        all_submissions = []
        for assignment in assignments:
            assignment_id = assignment.get('assignment_id')
            try:
                sub_response = submissions_table.query(
                    IndexName='AssignmentStudentIndex',
                    KeyConditionExpression=Key('assignment_id').eq(assignment_id)
                )
                all_submissions.extend(sub_response.get('Items', []))
            except Exception as e:
                print(f"Submissions query error for {assignment_id}: {e}")
        
        # Calculate average performance
        completed_submissions = [s for s in all_submissions if s.get('evaluation_status') == 'completed']
        avg_performance = 0
        if completed_submissions:
            scores = [s.get('final_score', 0) for s in completed_submissions if s.get('final_score')]
            avg_performance = round(sum(scores) / len(scores)) if scores else 0
        
        # 5. Get pending doubts (flagged status)
        try:
            doubts_response = doubts_table.query(
                IndexName='StatusIndex',
                KeyConditionExpression=Key('status').eq('flagged')
            )
            flagged_doubts = doubts_response.get('Items', [])
        except Exception as e:
            print(f"Doubts query error: {e}")
            flagged_doubts = []
        
        pending_doubts = len(flagged_doubts)
        
        # 6. Build classes list with student counts
        classes = []
        for class_id in unique_classes[:5]:  # Top 5 classes
            # Get subjects taught in this class
            class_assignments = [a for a in assignments if a.get('class_info') == class_id]
            subjects = list(set([a.get('subject', 'General') for a in class_assignments]))
            
            classes.append({
                'id': len(classes) + 1,
                'name': f'Grade {class_id}',
                'students': 40,  # Static 40 as requested
                'subject': subjects[0] if subjects else 'General',
                'schedule': 'Mon, Wed, Fri - 10:00 AM'  # Static for now
            })
        
        # If no classes found, show default
        if not classes:
            classes = [
                {
                    'id': 1,
                    'name': 'Grade 7 Mathematics',
                    'students': 28,
                    'subject': subject_specialization[0] if subject_specialization else 'Mathematics',
                    'schedule': 'Mon, Wed, Fri - 10:00 AM'
                }
            ]
        
        # 7. Recent activities
        recent_activities = []
        
        # Add recent content
        sorted_content = sorted(master_content, key=lambda x: x.get('createdAt', ''), reverse=True)[:3]
        for content in sorted_content:
            try:
                created_at = datetime.fromisoformat(content.get('createdAt', '').replace('Z', '+00:00'))
                time_ago = get_time_ago(created_at)
            except:
                time_ago = 'Recently'
            
            recent_activities.append({
                'id': content.get('contentId'),
                'action': f"Scheduled content for {content.get('subject', 'subject')}",
                'time': time_ago,
                'type': 'content'
            })
        
        # Add recent assignments
        sorted_assignments = sorted(assignments, key=lambda x: x.get('created_at', ''), reverse=True)[:3]
        for assignment in sorted_assignments:
            try:
                created_at = datetime.fromisoformat(assignment.get('created_at', '').replace('Z', '+00:00'))
                time_ago = get_time_ago(created_at)
            except:
                time_ago = 'Recently'
            
            recent_activities.append({
                'id': assignment.get('assignment_id'),
                'action': f"Created assignment: {assignment.get('title', 'Untitled')}",
                'time': time_ago,
                'type': 'assignment'
            })
        
        # Add recent doubts
        sorted_doubts = sorted(flagged_doubts, key=lambda x: x.get('timestamp', ''), reverse=True)[:2]
        for doubt in sorted_doubts:
            try:
                timestamp = datetime.fromisoformat(doubt.get('timestamp', '').replace('Z', '+00:00'))
                time_ago = get_time_ago(timestamp)
            except:
                time_ago = 'Recently'
            
            recent_activities.append({
                'id': doubt.get('doubtId'),
                'action': f"Student submitted doubt about {doubt.get('subject', 'topic')}",
                'time': time_ago,
                'type': 'doubt'
            })
        
        # Sort all activities by time
        recent_activities = sorted(recent_activities, 
                                   key=lambda x: parse_time_ago(x['time']), 
                                   reverse=False)[:5]
        
        # 8. Build response
        dashboard_data = {
            'stats': {
                'totalStudents': total_students,
                'worksheetsCreated': total_assignments,
                'avgPerformance': f'{avg_performance}%',
                'pendingDoubts': pending_doubts
            },
            'classes': classes,
            'recentActivities': recent_activities
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': dashboard_data
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
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

def get_time_ago(dt):
    """Convert datetime to human-readable time ago"""
    now = datetime.now(dt.tzinfo)
    diff = now - dt
    
    if diff.days > 0:
        if diff.days == 1:
            return '1 day ago'
        return f'{diff.days} days ago'
    
    hours = diff.seconds // 3600
    if hours > 0:
        if hours == 1:
            return '1 hour ago'
        return f'{hours} hours ago'
    
    minutes = diff.seconds // 60
    if minutes > 0:
        if minutes == 1:
            return '1 minute ago'
        return f'{minutes} minutes ago'
    
    return 'Just now'

def parse_time_ago(time_str):
    """Parse time ago string to minutes for sorting"""
    if 'just now' in time_str.lower():
        return 0
    if 'minute' in time_str:
        return int(time_str.split()[0])
    if 'hour' in time_str:
        return int(time_str.split()[0]) * 60
    if 'day' in time_str:
        return int(time_str.split()[0]) * 1440
    return 99999  # Old items
