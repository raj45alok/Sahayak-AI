import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')
assignments_table = dynamodb.Table('Assignments-dev')
submissions_table = dynamodb.Table('Submissions-dev')
doubts_table = dynamodb.Table('DoubtQueue')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

# Static Grade 7 NCERT Schedule
def get_static_schedule(class_id):
    """Generate realistic Grade 7 school schedule"""
    schedule_template = {
        '7A': [
            {'subject': 'Mathematics', 'teacher': 'Mr. Sharma', 'time': '9:00 AM - 9:45 AM', 'topic': 'Integers', 'room': 'Room 101', 'status': 'upcoming'},
            {'subject': 'Science', 'teacher': 'Ms. Verma', 'time': '9:50 AM - 10:35 AM', 'topic': 'Nutrition in Plants', 'room': 'Lab A', 'status': 'upcoming'},
            {'subject': 'Break', 'time': '10:35 AM - 10:55 AM', 'type': 'break'},
            {'subject': 'English', 'teacher': 'Mrs. Patel', 'time': '10:55 AM - 11:40 AM', 'topic': 'Grammar', 'room': 'Room 203', 'status': 'upcoming'},
            {'subject': 'Social Science', 'teacher': 'Mr. Kumar', 'time': '11:45 AM - 12:30 PM', 'topic': 'Medieval India', 'room': 'Room 105', 'status': 'upcoming'},
            {'subject': 'Lunch Break', 'time': '12:30 PM - 1:15 PM', 'type': 'break'},
            {'subject': 'Hindi', 'teacher': 'Mrs. Singh', 'time': '1:15 PM - 2:00 PM', 'topic': 'व्याकरण', 'room': 'Room 204', 'status': 'upcoming'},
            {'subject': 'Computer Science', 'teacher': 'Mr. Reddy', 'time': '2:05 PM - 2:50 PM', 'topic': 'Scratch Programming', 'room': 'Computer Lab', 'status': 'upcoming'}
        ],
        '7B': [
            {'subject': 'English', 'teacher': 'Mrs. Patel', 'time': '9:00 AM - 9:45 AM', 'topic': 'Reading Comprehension', 'room': 'Room 203', 'status': 'upcoming'},
            {'subject': 'Mathematics', 'teacher': 'Mr. Sharma', 'time': '9:50 AM - 10:35 AM', 'topic': 'Fractions', 'room': 'Room 101', 'status': 'upcoming'},
            {'subject': 'Break', 'time': '10:35 AM - 10:55 AM', 'type': 'break'},
            {'subject': 'Science', 'teacher': 'Ms. Verma', 'time': '10:55 AM - 11:40 AM', 'topic': 'Acids and Bases', 'room': 'Lab A', 'status': 'upcoming'},
            {'subject': 'Hindi', 'teacher': 'Mrs. Singh', 'time': '11:45 AM - 12:30 PM', 'topic': 'कहानी', 'room': 'Room 204', 'status': 'upcoming'},
            {'subject': 'Lunch Break', 'time': '12:30 PM - 1:15 PM', 'type': 'break'},
            {'subject': 'Social Science', 'teacher': 'Mr. Kumar', 'time': '1:15 PM - 2:00 PM', 'topic': 'Physical Geography', 'room': 'Room 105', 'status': 'upcoming'},
            {'subject': 'Computer Science', 'teacher': 'Mr. Reddy', 'time': '2:05 PM - 2:50 PM', 'topic': 'MS Office', 'room': 'Computer Lab', 'status': 'upcoming'}
        ]
    }
    
    # Default schedule for other classes
    default_schedule = [
        {'subject': 'Mathematics', 'teacher': 'Teacher', 'time': '9:00 AM - 9:45 AM', 'topic': 'Daily Lesson', 'room': 'Room 101', 'status': 'upcoming'},
        {'subject': 'Science', 'teacher': 'Teacher', 'time': '9:50 AM - 10:35 AM', 'topic': 'Daily Lesson', 'room': 'Lab A', 'status': 'upcoming'},
        {'subject': 'Break', 'time': '10:35 AM - 10:55 AM', 'type': 'break'},
        {'subject': 'English', 'teacher': 'Teacher', 'time': '10:55 AM - 11:40 AM', 'topic': 'Daily Lesson', 'room': 'Room 203', 'status': 'upcoming'},
        {'subject': 'Lunch Break', 'time': '12:30 PM - 1:15 PM', 'type': 'break'}
    ]
    
    return schedule_template.get(class_id, default_schedule)

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
        
        # Get student from Users table
        user_response = users_table.get_item(
            Key={'userId': user_id, 'role': 'student'}
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
        class_id = user.get('classId', '')
        
        # 1. Get all submissions for this student
        try:
            submissions_response = submissions_table.query(
                IndexName='StudentSubmissionIndex',
                KeyConditionExpression=Key('student_id').eq(user_id)
            )
            submissions = submissions_response.get('Items', [])
        except Exception as e:
            print(f"Submissions query error: {e}")
            submissions = []
        
        # Calculate submission stats
        completed_submissions = [s for s in submissions if s.get('evaluation_status') == 'completed']
        pending_submissions = [s for s in submissions if s.get('status') == 'submitted' and s.get('evaluation_status') != 'completed']
        
        assignments_completed = len(completed_submissions)
        assignments_submitted = len(submissions)
        
        # Calculate average score
        avg_score = 0
        if completed_submissions:
            scores = [s.get('final_score', 0) for s in completed_submissions if s.get('final_score')]
            avg_score = round(sum(scores) / len(scores)) if scores else 0
        
        # 2. Get assignments for student's class
        try:
            assignments_response = assignments_table.query(
                IndexName='ClassAssignments',
                KeyConditionExpression=Key('class_info').eq(class_id)
            )
            all_assignments = assignments_response.get('Items', [])
        except Exception as e:
            print(f"Assignments query error: {e}")
            all_assignments = []
        
        # Find pending assignments (not submitted yet)
        submitted_assignment_ids = {s.get('assignment_id') for s in submissions}
        pending_assignments = [a for a in all_assignments if a.get('assignment_id') not in submitted_assignment_ids]
        pending_tasks = len(pending_assignments)
        
        # Get recent assignments with submission status
        recent_assignments = []
        for assignment in sorted(all_assignments, key=lambda x: x.get('created_at', ''), reverse=True)[:5]:
            assignment_id = assignment.get('assignment_id')
            submission = next((s for s in submissions if s.get('assignment_id') == assignment_id), None)
            
            # Calculate due date status
            due_date_str = assignment.get('due_date', '')
            if due_date_str:
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    now = datetime.now(due_date.tzinfo)
                    days_diff = (due_date - now).days
                    
                    if days_diff < 0:
                        due_status = f"{abs(days_diff)} days ago"
                    elif days_diff == 0:
                        due_status = "Today"
                    elif days_diff == 1:
                        due_status = "Tomorrow"
                    else:
                        due_status = f"In {days_diff} days"
                except:
                    due_status = "No due date"
            else:
                due_status = "No due date"
            
            recent_assignments.append({
                'id': assignment_id,
                'title': assignment.get('title', 'Untitled Assignment'),
                'subject': assignment.get('subject', 'General'),
                'dueDate': due_status,
                'status': 'completed' if submission else 'pending',
                'score': submission.get('final_score') if submission else None
            })
        
        # 3. Get doubts for this student
        try:
            doubts_response = doubts_table.query(
                IndexName='StudentIndex',
                KeyConditionExpression=Key('studentId').eq(user_id)
            )
            doubts = doubts_response.get('Items', [])
        except Exception as e:
            print(f"Doubts query error: {e}")
            doubts = []
        
        doubts_resolved = len([d for d in doubts if d.get('status') in ['answered', 'resolved']])
        
        # 4. Calculate learning progress by subject
        subject_scores = {}
        for sub in completed_submissions:
            # Get assignment to find subject
            assignment_id = sub.get('assignment_id')
            assignment = next((a for a in all_assignments if a.get('assignment_id') == assignment_id), None)
            if assignment:
                subject = assignment.get('subject', 'General')
                score = sub.get('final_score', 0)
                if subject not in subject_scores:
                    subject_scores[subject] = []
                subject_scores[subject].append(score)
        
        learning_progress = []
        for subject, scores in subject_scores.items():
            avg = round(sum(scores) / len(scores)) if scores else 0
            learning_progress.append({
                'subject': subject,
                'progress': avg,
                'color': 'bg-blue-500'  # Frontend can customize
            })
        
        # 5. Get enrolled classes (based on assignments available)
        unique_subjects = list(set([a.get('subject', 'General') for a in all_assignments]))
        enrolled_classes = []
        for subject in unique_subjects[:3]:  # Top 3 subjects
            enrolled_classes.append({
                'id': f'{subject[:3].upper()}101',
                'subject': subject,
                'teacher': 'Teacher Name',  # Static for now
                'students': 40,  # Static as requested
                'nextClass': 'Tomorrow, 10:00 AM',  # Static
                'topic': 'Current Topic',
                'status': 'active'
            })
        
        # 6. Build response
        dashboard_data = {
            'stats': {
                'assignmentsCompleted': assignments_completed,
                'assignmentsTotal': len(all_assignments),
                'assignmentsSubmitted': assignments_submitted,
                'pendingTasks': pending_tasks,
                'doubtsResolved': doubts_resolved,
                'todayClasses': len(get_static_schedule(class_id))  # Count of periods
            },
            'recentAssignments': recent_assignments,
            'enrolledClasses': enrolled_classes,
            'todaySchedule': get_static_schedule(class_id),
            'learningProgress': learning_progress if learning_progress else [
                {'subject': 'Mathematics', 'progress': 75, 'color': 'bg-blue-500'},
                {'subject': 'Science', 'progress': 80, 'color': 'bg-green-500'}
            ],
            'recentAchievements': [
                {
                    'title': 'Quick Learner',
                    'description': f'Completed {assignments_completed} assignments',
                    'date': 'This week',
                    'icon': '🚀'
                }
            ] if assignments_completed > 0 else []
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
