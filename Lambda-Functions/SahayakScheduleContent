import json
import boto3
from datetime import datetime, timedelta
import pytz

# Initialize clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
events_client = boto3.client('events', region_name='us-east-1')
lambda_client = boto3.client('lambda', region_name='us-east-1')

# Configuration
TABLE_NAME = 'sahayak-content'
DEFAULT_DELIVERY_TIME = '08:00'  # 8:00 AM IST
DEFAULT_INTERVAL_DAYS = 2  # Alternate days (48 hours)
IST = pytz.timezone('Asia/Kolkata')
UTC = pytz.UTC

table = dynamodb.Table(TABLE_NAME)

def cors_response(status_code, body):
    """Helper to return response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
        },
        'body': json.dumps(body)
    }

def calculate_schedule_dates(start_date_str, total_parts, delivery_time_str=None, interval_days=None):
    """
    Calculate delivery dates for all parts with custom time and interval
    Falls back to defaults if not provided: 08:00 AM, alternate days (2 days)
    
    Args:
        start_date_str: "YYYY-MM-DD" or None (defaults to today)
        total_parts: number of parts to schedule
        delivery_time_str: "HH:MM" format or None (defaults to 08:00)
        interval_days: days between deliveries or None (defaults to 2)
    """
    
    # Apply defaults if not provided
    if delivery_time_str is None or delivery_time_str == "":
        delivery_time_str = DEFAULT_DELIVERY_TIME
        print(f"Using default delivery time: {DEFAULT_DELIVERY_TIME}")
    
    if interval_days is None or not isinstance(interval_days, int) or interval_days < 1:
        interval_days = DEFAULT_INTERVAL_DAYS
        print(f"Using default interval: {DEFAULT_INTERVAL_DAYS} days")
    
    # Parse delivery time
    try:
        hour, minute = map(int, delivery_time_str.split(':'))
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            raise ValueError("Invalid time")
    except:
        # Fallback to default if parsing fails
        hour, minute = 8, 0
        delivery_time_str = DEFAULT_DELIVERY_TIME
        print(f"Invalid time format, using default: {DEFAULT_DELIVERY_TIME}")
    
    # Parse start date
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            start_date = IST.localize(start_date.replace(hour=hour, minute=minute, second=0))
        except ValueError:
            start_date = datetime.now(IST).replace(hour=hour, minute=minute, second=0, microsecond=0)
            print(f"Invalid date format, using today")
    else:
        start_date = datetime.now(IST).replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    schedule = []
    for part_num in range(1, total_parts + 1):
        # Calculate delivery date based on interval
        days_offset = (part_num - 1) * interval_days
        delivery_date = start_date + timedelta(days=days_offset)
        
        # Set custom time
        delivery_date = delivery_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        schedule.append({
            'partNumber': part_num,
            'deliveryDate': delivery_date,
            'deliveryDateISO': delivery_date.isoformat(),
            'deliveryDateUTC': delivery_date.astimezone(UTC),
            'deliveryTimeIST': delivery_time_str
        })
    
    return schedule, delivery_time_str, interval_days

def create_eventbridge_rule(content_id, part_number, delivery_date_utc):
    """Create EventBridge rule for scheduled delivery"""
    
    rule_name = f"sahayak-delivery-{content_id}-part-{part_number}"
    
    # Convert to cron (UTC)
    cron_expression = f"cron({delivery_date_utc.minute} {delivery_date_utc.hour} {delivery_date_utc.day} {delivery_date_utc.month} ? {delivery_date_utc.year})"
    
    try:
        # Get account ID safely
        try:
            account_id = boto3.client('sts').get_caller_identity()['Account']
        except:
            account_id = '029179924107'
        
        lambda_arn = f"arn:aws:lambda:us-east-1:{account_id}:function:SahayakDeliverContent"
        
        # Create rule
        events_client.put_rule(
            Name=rule_name,
            ScheduleExpression=cron_expression,
            State='ENABLED',
            Description=f"Deliver {content_id} part {part_number}"
        )
        
        # Add target
        events_client.put_targets(
            Rule=rule_name,
            Targets=[{
                'Id': '1',
                'Arn': lambda_arn,
                'Input': json.dumps({
                    'contentId': content_id,
                    'partNumber': f"PART-{part_number}"
                })
            }]
        )
        
        # Grant permission
        try:
            lambda_client.add_permission(
                FunctionName='SahayakDeliverContent',
                StatementId=f"{rule_name}-invoke",
                Action='lambda:InvokeFunction',
                Principal='events.amazonaws.com',
                SourceArn=f"arn:aws:events:us-east-1:{account_id}:rule/{rule_name}"
            )
        except (lambda_client.exceptions.ResourceConflictException, 
                lambda_client.exceptions.ResourceNotFoundException):
            pass
        
        print(f"✅ Created rule: {rule_name} - {cron_expression}")
        return {'ruleName': rule_name, 'cronExpression': cron_expression, 'success': True}
        
    except Exception as e:
        print(f"❌ Rule creation failed: {str(e)}")
        return {'ruleName': rule_name, 'success': False, 'error': str(e)}

def lambda_handler(event, context):
    """
    Schedule content delivery with custom or default settings
    
    Input:
    {
        "contentId": "CNT-xxx",
        "startDate": "2025-10-05" (optional - defaults to today),
        "deliveryTime": "10:30" (optional - defaults to 08:00),
        "intervalDays": 2 (optional - defaults to 2 = alternate days),
        "classId": "7A"
    }
    
    DEFAULT BEHAVIOR (if deliveryTime and intervalDays not provided):
    - Delivery Time: 08:00 AM IST
    - Interval: 2 days (alternate days / 48 hours)
    """
    
    # Handle OPTIONS request for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response(200, {'message': 'OK'})
    
    try:
        body = json.loads(event['body']) if 'body' in event else event
        
        content_id = body['contentId']
        start_date = body.get('startDate')  # Optional
        delivery_time = body.get('deliveryTime')  # Optional - defaults to 08:00
        interval_days = body.get('intervalDays')  # Optional - defaults to 2
        class_id = body.get('classId')  # For reference
        
        print(f"Scheduling content: {content_id}")
        print(f"Start date: {start_date or 'TODAY'}")
        print(f"Delivery time requested: {delivery_time or 'DEFAULT (08:00)'}")
        print(f"Interval requested: {interval_days or 'DEFAULT (2 days)'}")
        print(f"Class: {class_id}")
        
        # Get master record
        master_response = table.get_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'}
        )
        
        if 'Item' not in master_response:
            raise Exception(f"Content {content_id} not found")
        
        master_item = master_response['Item']
        
        # Check status - allow rescheduling if already scheduled
        allowed_statuses = ['split_complete', 'ready_for_preview', 'enhancement_complete', 'scheduled']
        current_status = master_item.get('status')
        
        if current_status not in allowed_statuses:
            raise Exception(f"Content not ready for scheduling. Current status: {current_status}")
        
        # If already scheduled, delete old EventBridge rules before creating new ones
        if current_status == 'scheduled':
            print(f"Content already scheduled. Will delete old rules and reschedule.")
            try:
                # Query all parts to get old rule names
                old_parts = content_table.query(
                    KeyConditionExpression=Key('contentId').eq(content_id) & Key('partNumber').begins_with('PART-')
                )
                
                for old_part in old_parts.get('Items', []):
                    old_rule_name = old_part.get('eventBridgeRule')
                    if old_rule_name:
                        try:
                            # Remove targets first
                            events_client.remove_targets(Rule=old_rule_name, Ids=['1'])
                            # Delete rule
                            events_client.delete_rule(Name=old_rule_name)
                            print(f"Deleted old rule: {old_rule_name}")
                        except Exception as e:
                            print(f"Could not delete old rule {old_rule_name}: {str(e)}")
            except Exception as e:
                print(f"Error cleaning up old rules: {str(e)}")
        
        total_parts = int(master_item['totalParts'])
        stored_class_id = master_item['classId']
        subject = master_item['subject']
        
        # Calculate schedule with defaults applied if needed
        schedule, final_delivery_time, final_interval_days = calculate_schedule_dates(
            start_date, total_parts, delivery_time, interval_days
        )
        
        print(f"Final schedule settings:")
        print(f"  Delivery Time: {final_delivery_time} IST")
        print(f"  Interval: Every {final_interval_days} day(s)")
        print(f"  Total Parts: {total_parts}")
        
        for item in schedule:
            print(f"  Part {item['partNumber']}: {item['deliveryDateISO']} ({item['deliveryTimeIST']} IST)")
        
        # Create EventBridge rules and update DynamoDB
        created_rules = []
        
        for item in schedule:
            part_num = item['partNumber']
            part_key = f"PART-{part_num}"
            
            # Create EventBridge rule
            rule_result = create_eventbridge_rule(
                content_id=content_id,
                part_number=part_num,
                delivery_date_utc=item['deliveryDateUTC']
            )
            
            created_rules.append(rule_result)
            
            # Update part in DynamoDB with schedule
            table.update_item(
                Key={'contentId': content_id, 'partNumber': part_key},
                UpdateExpression='''
                    SET scheduleDate = :date,
                        deliveryTime = :time,
                        deliveryTimeIST = :timeIST,
                        intervalDays = :interval,
                        eventBridgeRule = :rule,
                        #status = :status,
                        updatedAt = :updated
                ''',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':date': item['deliveryDateISO'],
                    ':time': item['deliveryDateUTC'].isoformat(),
                    ':timeIST': final_delivery_time,
                    ':interval': final_interval_days,
                    ':rule': rule_result['ruleName'],
                    ':status': 'scheduled',
                    ':updated': datetime.now(UTC).isoformat()
                }
            )
        
        # Update master record with schedule settings
        table.update_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'},
            UpdateExpression='''
                SET #status = :status,
                    scheduledDate = :scheduled,
                    scheduleStartDate = :start,
                    scheduleEndDate = :end,
                    deliveryTimeIST = :timeIST,
                    intervalDays = :interval,
                    totalScheduledParts = :total,
                    updatedAt = :updated
            ''',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'scheduled',
                ':scheduled': datetime.now(UTC).isoformat(),
                ':start': schedule[0]['deliveryDateISO'],
                ':end': schedule[-1]['deliveryDateISO'],
                ':timeIST': final_delivery_time,
                ':interval': final_interval_days,
                ':total': total_parts,
                ':updated': datetime.now(UTC).isoformat()
            }
        )
        
        print(f"✅ Successfully scheduled {total_parts} parts")
        
        # Determine if using defaults
        using_defaults = (delivery_time is None or delivery_time == "") and (interval_days is None)
        
        return cors_response(200, {
            'contentId': content_id,
            'status': 'scheduled',
            'totalParts': total_parts,
            'startDate': schedule[0]['deliveryDateISO'],
            'endDate': schedule[-1]['deliveryDateISO'],
            'deliveryTime': final_delivery_time,
            'intervalDays': final_interval_days,
            'usingDefaults': using_defaults,
            'classId': stored_class_id,
            'subject': subject,
            'schedule': [
                {
                    'part': s['partNumber'],
                    'deliveryDate': s['deliveryDateISO'],
                    'deliveryTime': s['deliveryTimeIST']
                }
                for s in schedule
            ],
            'eventBridgeRules': created_rules,
            'message': f'Content scheduled successfully - {total_parts} parts, every {final_interval_days} day(s) at {final_delivery_time} IST' + 
                      (' (using defaults)' if using_defaults else '')
        })
        
    except Exception as e:
        print(f"Scheduling error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return cors_response(500, {
            'error': str(e),
            'message': 'Failed to schedule content'
        })
