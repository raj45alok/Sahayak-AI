import json
import boto3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os

# Initialize clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Configuration
CONTENT_TABLE = 'sahayak-content'
USERS_TABLE = 'Users'
GMAIL_USER = os.environ.get('GMAIL_USER')
GMAIL_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')

content_table = dynamodb.Table(CONTENT_TABLE)
users_table = dynamodb.Table(USERS_TABLE)

def get_students_by_class(class_id):
    """Fetch all students in a class with multiple format support"""
    try:
        # Try different class ID formats
        class_id_variants = [
            class_id,  # Original format
            f"Grade {class_id}" if not class_id.startswith("Grade ") else class_id,
            class_id.replace("Grade ", "") if class_id.startswith("Grade ") else class_id
        ]
        
        # Remove duplicates
        class_id_variants = list(set(class_id_variants))
        
        students = []
        for variant in class_id_variants:
            try:
                response = users_table.query(
                    IndexName='ClassIdIndex',
                    KeyConditionExpression='classId = :cid',
                    ExpressionAttributeValues={':cid': variant}
                )
                
                for item in response.get('Items', []):
                    if item.get('role') == 'student':
                        students.append({
                            'userId': item['userId'],
                            'name': item.get('name', 'Student'),
                            'email': item.get('email', '')
                        })
                
                # If we found students with this variant, break early
                if students:
                    print(f"Found students using classId: {variant}")
                    break
                    
            except Exception as query_error:
                print(f"Query failed for classId '{variant}': {query_error}")
                continue
        
        print(f"Total found {len(students)} students in class {class_id}")
        return students
        
    except Exception as e:
        print(f"Error fetching students: {str(e)}")
        return []

def send_email(to_email, student_name, subject_name, part_num, content_summary, videos, questions):
    """Send email notification using Gmail SMTP"""
    
    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("Gmail credentials not configured")
        return False
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"📚 New {subject_name} Lesson - Part {part_num}"
    msg['From'] = GMAIL_USER
    msg['To'] = to_email
    
    # Create HTML body
    video_html = ""
    if videos:
        video_html = "<h3>📺 Video Resources</h3><ul>"
        for v in videos[:2]:
            video_html += f'<li><a href="{v["url"]}">{v["title"]}</a> - {v.get("channelTitle", "")}</li>'
        video_html += "</ul>"
    
    questions_html = ""
    if questions:
        questions_html = "<h3>❓ Practice Questions</h3><ol>"
        for q in questions:
            questions_html += f"<li>{q}</li>"
        questions_html += "</ol>"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Hello {student_name}! 👋</h2>
          <p style="margin: 10px 0 0 0;">Your new lesson is ready</p>
        </div>
        
        <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 10px 10px;">
          <h3 style="color: #333;">📖 {subject_name} - Part {part_num}</h3>
          <p style="color: #666; line-height: 1.6;">{content_summary}</p>
          
          {video_html}
          
          {questions_html}
          
          <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #667eea; border-radius: 5px;">
            <p style="margin: 0; color: #555;">💡 <strong>Tip:</strong> Watch the videos first, then try answering the questions!</p>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This is an automated message from Sahayak AI. Questions? Contact your teacher.
          </p>
        </div>
      </body>
    </html>
    """
    
    # Attach HTML
    part = MIMEText(html, 'html')
    msg.attach(part)
    
    # Send email
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False

def lambda_handler(event, context):
    """
    Triggered by EventBridge
    
    Input:
    {
        "contentId": "CNT-xxx",
        "partNumber": "PART-1"
    }
    """
    
    try:
        content_id = event['contentId']
        part_number = event['partNumber']
        
        print(f"Delivering {content_id}/{part_number}")
        
        # Get content part
        part_response = content_table.get_item(
            Key={'contentId': content_id, 'partNumber': part_number}
        )
        
        if 'Item' not in part_response:
            raise Exception(f"Part not found: {content_id}/{part_number}")
        
        part_item = part_response['Item']
        
        # Get master record for class info
        master_response = content_table.get_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'}
        )
        
        if 'Item' not in master_response:
            raise Exception(f"Master record not found: {content_id}")
        
        master_item = master_response['Item']
        class_id = master_item['classId']
        subject = master_item['subject']
        
        # Get students
        students = get_students_by_class(class_id)
        
        if not students:
            print(f"No students found in class {class_id}")
            # Still mark as delivered
            content_table.update_item(
                Key={'contentId': content_id, 'partNumber': part_number},
                UpdateExpression='SET #status = :status, deliveredAt = :time',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'delivered',
                    ':time': datetime.utcnow().isoformat()
                }
            )
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'No students to notify'})
            }
        
        # Extract data
        summary = part_item.get('summary', 'New lesson available')
        enhanced_content = part_item.get('enhancedContent', '')
        videos = part_item.get('videoLinks', [])
        questions = part_item.get('practiceQuestions', [])
        part_num = int(part_number.split('-')[1])
        
        # Create brief summary for email (first 200 chars)
        if enhanced_content:
            content_preview = enhanced_content[:200].replace('#', '').strip() + "..."
        else:
            content_preview = summary
        
        # Send emails to all students
        sent_count = 0
        failed_count = 0
        
        for student in students:
            if student['email']:
                success = send_email(
                    to_email=student['email'],
                    student_name=student['name'],
                    subject_name=subject,
                    part_num=part_num,
                    content_summary=content_preview,
                    videos=videos,
                    questions=questions
                )
                
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            else:
                print(f"Student {student['userId']} has no email")
                failed_count += 1
        
        # Update part status to delivered
        content_table.update_item(
            Key={'contentId': content_id, 'partNumber': part_number},
            UpdateExpression='SET #status = :status, deliveredAt = :time, emailsSent = :sent, emailsFailed = :failed',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'delivered',
                ':time': datetime.utcnow().isoformat(),
                ':sent': sent_count,
                ':failed': failed_count
            }
        )
        
        print(f"Delivery complete: {sent_count} sent, {failed_count} failed")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'contentId': content_id,
                'partNumber': part_number,
                'studentCount': len(students),
                'emailsSent': sent_count,
                'emailsFailed': failed_count,
                'message': 'Content delivered successfully'
            })
        }
        
    except Exception as e:
        print(f"Delivery error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Delivery failed'
            })
        }
