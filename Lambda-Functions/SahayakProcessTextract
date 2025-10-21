import json
import boto3
import base64
import uuid
from datetime import datetime
import io
import re

# Initialize clients
s3 = boto3.client('s3', region_name='us-east-1')
textract = boto3.client('textract', region_name='us-east-1')
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
lambda_client = boto3.client('lambda', region_name='us-east-1')

BUCKET_NAME = 'sahayak-study-content'
TABLE_NAME = 'sahayak-content'
NOVA_MICRO = 'amazon.nova-micro-v1:0'
KB_ID = 'EQUSJEXPFY'

table = dynamodb.Table(TABLE_NAME)

def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF using Amazon Textract"""
    try:
        print("Starting Textract PDF extraction...")
        
        # Method 1: Direct byte analysis (for smaller files)
        if len(pdf_bytes) <= 5 * 1024 * 1024:
            try:
                print("Using Textract analyze_document (direct bytes)")
                response = textract.analyze_document(
                    Document={'Bytes': pdf_bytes},
                    FeatureTypes=['TABLES', 'FORMS']
                )
                text = extract_text_from_textract_response(response)
                print(f"Textract direct extraction successful: {len(text)} characters")
                return text
            except Exception as direct_error:
                print(f"Direct extraction failed: {str(direct_error)}. Trying S3 method...")
        
        # Method 2: S3-based Textract
        print("Using S3-based Textract extraction")
        temp_key = f"temp/{uuid.uuid4().hex}.pdf"
        
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=temp_key,
            Body=pdf_bytes,
            ContentType='application/pdf'
        )
        
        try:
            response = textract.start_document_text_detection(
                DocumentLocation={
                    'S3Object': {
                        'Bucket': BUCKET_NAME,
                        'Name': temp_key
                    }
                }
            )
            
            job_id = response['JobId']
            print(f"Textract job started: {job_id}")
            
            import time
            max_wait_time = 150
            wait_interval = 6
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                job_response = textract.get_document_text_detection(JobId=job_id)
                status = job_response['JobStatus']
                
                if status == 'SUCCEEDED':
                    text = extract_text_from_textract_response(job_response)
                    print(f"Textract S3 extraction successful: {len(text)} characters")
                    break
                elif status == 'FAILED':
                    raise Exception(f"Textract job failed: {job_response.get('StatusMessage', 'Unknown error')}")
                elif status == 'PARTIAL_SUCCESS':
                    text = extract_text_from_textract_response(job_response)
                    print(f"Textract partial success: {len(text)} characters")
                    break
                
                time.sleep(wait_interval)
                elapsed_time += wait_interval
                print(f"Waiting for Textract job... {elapsed_time}s")
            else:
                raise Exception("Textract job timed out")
                
            return text
            
        finally:
            try:
                s3.delete_object(Bucket=BUCKET_NAME, Key=temp_key)
                print("Temporary S3 file cleaned up")
            except Exception as cleanup_error:
                print(f"Cleanup warning: {str(cleanup_error)}")
                
    except Exception as e:
        print(f"Textract extraction error: {str(e)}")
        raise Exception(f"Failed to extract PDF with Textract: {str(e)}")

def extract_text_from_textract_response(response):
    """Extract and combine text from Textract response"""
    text_parts = []
    
    if 'Blocks' in response:
        blocks = response['Blocks']
    elif ('DocumentMetadata' in response and 
          'Pages' in response.get('DocumentMetadata', {}) and
          'Blocks' in response):
        blocks = response['Blocks']
    else:
        blocks = []
        for key, value in response.items():
            if isinstance(value, list) and len(value) > 0 and 'BlockType' in value[0]:
                blocks = value
                break
    
    for block in blocks:
        block_type = block.get('BlockType')
        if block_type in ['LINE', 'WORD']:
            text = block.get('Text', '').strip()
            if text:
                text_parts.append(text)
    
    full_text = ' '.join(text_parts)
    full_text = re.sub(r'\n\s*\n', '\n\n', full_text)
    full_text = re.sub(r'[ \t]+', ' ', full_text)
    
    return full_text.strip()

def fetch_from_knowledge_base(topic, subject, language):
    """Fetch content from Knowledge Base for a topic"""
    try:
        query = f"Class 7 NCERT {subject} {topic} complete chapter content detailed explanation"
        if language:
            query += f" {language}"
        
        print(f"Querying KB with: {query}")
        
        response = bedrock_agent.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={'text': query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 10
                }
            }
        )
        
        chunks = []
        for result in response.get('retrievalResults', []):
            chunk_text = result['content']['text']
            score = result.get('score', 0)
            
            if score > 0.3:
                chunks.append(chunk_text)
        
        full_content = "\n\n".join(chunks)
        print(f"KB returned {len(chunks)} relevant chunks, total {len(full_content)} characters")
        
        return full_content
        
    except Exception as e:
        print(f"KB fetch failed: {str(e)}")
        return ""

def call_nova_split(content_text, num_parts, subject):
    """Use Nova Micro to split content intelligently"""
    
    word_count = len(content_text.split())
    chars_per_part = len(content_text) // num_parts
    
    prompt = f"""You are an educational content analyst for Indian Class 7 students.

Split this {subject} content into exactly {num_parts} logical learning modules.

Content length: {len(content_text)} characters, {word_count} words
Content preview (first 1500 chars):
{content_text[:1500]}

Requirements:
- Each module should be roughly {chars_per_part} characters
- Split at natural topic boundaries (paragraphs, sections)
- Each module = 40-60 minutes study time
- Must have {num_parts} parts, no more, no less

Return ONLY valid JSON array (no markdown, no explanation):
[
  {{
    "part": 1,
    "start_char": 0,
    "end_char": {chars_per_part},
    "summary": "Brief summary of this part",
    "estimated_minutes": 45
  }},
  {{
    "part": 2,
    "start_char": {chars_per_part},
    "end_char": {chars_per_part * 2},
    "summary": "Brief summary",
    "estimated_minutes": 50
  }}
]

Ensure last part ends at character {len(content_text)}.
"""

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "max_new_tokens": 2000,
            "temperature": 0.3
        }
    })
    
    try:
        response = bedrock_runtime.invoke_model(
            modelId=NOVA_MICRO,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        response_text = response_body['output']['message']['content'][0]['text']
        
        print(f"Nova response preview: {response_text[:300]}")
        
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            split_plan = json.loads(json_match.group())
            
            if len(split_plan) != num_parts:
                print(f"Warning: Expected {num_parts}, got {len(split_plan)}. Using fallback.")
                return fallback_split(content_text, num_parts)
            
            return split_plan
        else:
            print("No JSON found in Nova response. Using fallback.")
            return fallback_split(content_text, num_parts)
            
    except Exception as e:
        print(f"Nova split failed: {str(e)}. Using fallback.")
        return fallback_split(content_text, num_parts)

def fallback_split(content_text, num_parts):
    """Simple equal-size split as fallback"""
    total_chars = len(content_text)
    part_size = total_chars // num_parts
    
    splits = []
    for i in range(num_parts):
        start = i * part_size
        end = (i + 1) * part_size if i < num_parts - 1 else total_chars
        
        if i < num_parts - 1:
            search_start = max(0, end - 100)
            search_text = content_text[search_start:min(total_chars, end + 100)]
            para_break = search_text.find('\n\n')
            if para_break != -1:
                end = search_start + para_break
        
        part_text = content_text[start:end].strip()
        summary = part_text[:100].replace('\n', ' ') + "..."
        
        splits.append({
            'part': i + 1,
            'start_char': start,
            'end_char': end,
            'summary': summary,
            'estimated_minutes': 45
        })
    
    return splits

def lambda_handler(event, context):
    """
    Async background processing - extracts text, splits, triggers enhancement
    """
    
    try:
        print(f"Async processing started for contentId: {event.get('contentId')}")
        
        content_id = event['contentId']
        content_source = event['contentSource']
        timestamp = datetime.utcnow().isoformat()
        
        # Extract content based on source
        if content_source == "pdf_base64" or content_source == "s3_presigned":
            s3_key = event['s3Key']
            pdf_obj = s3.get_object(Bucket=BUCKET_NAME, Key=s3_key)
            pdf_bytes = pdf_obj['Body'].read()
            content_text = extract_text_from_pdf(pdf_bytes)
            
        elif content_source == "text_direct":
            content_text = event['textContent']
            
        elif content_source == "knowledge_base":
            kb_content = fetch_from_knowledge_base(
                topic=event['textContent'],
                subject=event['subject'],
                language=event['language']
            )
            
            if not kb_content or len(kb_content) < 500:
                raise Exception(f"Insufficient content found in Knowledge Base")
            
            content_text = kb_content
        else:
            raise Exception(f"Unknown content source: {content_source}")
        
        if not content_text or len(content_text) < 100:
            raise Exception(f"Content too short: {len(content_text)} characters")
        
        print(f"Final content: {len(content_text)} characters")
        
        # Save extracted text to S3
        text_s3_key = f"processed/{content_id}/content.txt"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=text_s3_key,
            Body=content_text.encode('utf-8'),
            ContentType='text/plain; charset=utf-8',
            Metadata={
                'source': content_source,
                'contentId': content_id
            }
        )
        
        # Split content
        split_plan = call_nova_split(
            content_text=content_text,
            num_parts=event['numParts'],
            subject=event['subject']
        )
        
        print(f"Split into {len(split_plan)} parts")
        
        # Update MASTER with text path
        table.update_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'},
            UpdateExpression='SET textS3Path = :path, #status = :status, updatedAt = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':path': text_s3_key,
                ':status': 'processing',
                ':time': timestamp
            }
        )
        
        # Store each PART
        for split in split_plan:
            part_num = split['part']
            part_content = content_text[split['start_char']:split['end_char']].strip()
            
            table.put_item(Item={
                'contentId': content_id,
                'partNumber': f"PART-{part_num}",
                'summary': split['summary'],
                'rawContent': part_content,
                'estimatedStudyTime': split['estimated_minutes'],
                'status': 'split_complete',
                'createdAt': timestamp,
                'updatedAt': timestamp
            })
        
        # Update MASTER status
        table.update_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'},
            UpdateExpression='SET #status = :status, updatedAt = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'split_complete',
                ':time': timestamp
            }
        )
        
        # Trigger enhancement Lambda
        try:
            enhancement_payload = {
                'contentId': content_id,
                'subject': event['subject'],
                'language': event['language'],
                'instructions': event['instructions']
            }
            
            lambda_client.invoke(
                FunctionName='SahayakEnhanceAllParts',
                InvocationType='Event',
                Payload=json.dumps(enhancement_payload)
            )
            
            print(f"Enhancement Lambda triggered for {content_id}")
            
        except Exception as trigger_error:
            print(f"Failed to trigger enhancement: {str(trigger_error)}")
        
        print(f"Async processing completed for {content_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'contentId': content_id,
                'status': 'split_complete',
                'totalParts': len(split_plan)
            })
        }
        
    except Exception as e:
        print(f"Error in async processing: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Update MASTER status to failed
        try:
            table.update_item(
                Key={'contentId': event['contentId'], 'partNumber': 'MASTER'},
                UpdateExpression='SET #status = :status, errorMessage = :error, updatedAt = :time',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'failed',
                    ':error': str(e),
                    ':time': datetime.utcnow().isoformat()
                }
            )
        except:
            pass
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Async processing failed'
            })
        }
