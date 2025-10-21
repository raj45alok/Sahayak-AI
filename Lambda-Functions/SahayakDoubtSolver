import json
import boto3
import uuid
import re
from datetime import datetime
from langdetect import detect, LangDetectException
from boto3.dynamodb.conditions import Key


bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
translate_client = boto3.client('translate', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('DoubtQueue')


# Using Amazon Nova Pro for all queries
BEDROCK_MODEL_ID = 'amazon.nova-pro-v1:0'
KNOWLEDGE_BASE_ID = 'EQUSJEXPFY'

# Subject keywords for detection
MATH_KEYWORDS = ['add', 'subtract', 'multiply', 'divide', 'fraction', 'decimal', 'percentage', 
                 'algebra', 'geometry', 'equation', 'calculate', 'solve', 'lcm', 'hcf',
                 'जोड़', 'घटाव', 'गुणा', 'भाग', 'अंश', 'दशमलव', 'प्रतिशत', 'समीकरण',
                 'बेरीज', 'वजाबाकी', 'गुणाकार', 'भागाकार', 'समीकरण']

SCIENCE_KEYWORDS = ['science', 'physics', 'chemistry', 'biology', 'experiment', 'cell', 'atom',
                    'विज्ञान', 'भौतिकी', 'रसायन', 'जीवविज्ञान', 'कोशिका', 'परमाणु',
                    'विज्ञान', 'प्रयोग', 'अणू']

SOCIAL_KEYWORDS = ['history', 'geography', 'civics', 'political', 'social', 'medieval', 'empire',
                   'इतिहास', 'भूगोल', 'नागरिक', 'राजनीति', 'सामाजिक', 'साम्राज्य',
                   'इतिहास', 'भूगोल']


def detect_language(text):
    """Detect language of the question"""
    try:
        lang = detect(text)
        if lang in ['hi', 'mr', 'ta', 'te', 'bn']:
            return lang
        else:
            return 'en'
    except LangDetectException:
        return 'en'

def detect_subject(question):
    """
    Detect subject type from question
    Returns: 'math', 'science', 'social', or 'general'
    """
    question_lower = question.lower()
    
    if any(keyword in question_lower for keyword in MATH_KEYWORDS):
        return 'math'
    
    if any(keyword in question_lower for keyword in SCIENCE_KEYWORDS):
        return 'science'
    
    if any(keyword in question_lower for keyword in SOCIAL_KEYWORDS):
        return 'social'
    
    return 'general'

def translate_text(text, source_lang, target_lang):
    """Translate text using Amazon Translate"""
    try:
        if source_lang == target_lang:
            return text
        
        response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_lang,
            TargetLanguageCode=target_lang
        )
        
        return response['TranslatedText']
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text

def is_answer_sufficient(answer, citations):
    """
    Evaluate if KB answer is sufficient or needs enhancement
    Returns: (is_sufficient: bool, reason: str)
    """
    if not answer or len(answer.strip()) < 50:
        return False, "Answer too short"
    
    insufficient_hindi = [
        'पर्याप्त जानकारी नहीं',
        'जानकारी नहीं मिली',
        'सटीक कारण नहीं मिल',
        'सटीक कारणों के लिए',
        'पर्याप्त डेटा नहीं',
        'विशिष्ट जानकारी की आवश्यकता',
        'खोज परिणामों में उपलब्ध नहीं',
        'कोई सटीक',
        'सामान्य कारणों का वर्णन'
    ]
    
    insufficient_english = [
        'not enough information',
        'insufficient data',
        'no information found',
        'cannot find',
        'not available',
        'specific information needed',
        'more information required',
        'exact cause not found'
    ]
    
    answer_lower = answer.lower()
    
    for phrase in insufficient_hindi + insufficient_english:
        if phrase.lower() in answer_lower:
            return False, f"Insufficient content indicator found: {phrase}"
    
    # Check if answer ends with apology or disclaimer
    disclaimer_phrases_hindi = [
        'उपलब्ध नहीं है',
        'जानकारी नहीं है',
        'पता नहीं'
    ]
    
    for phrase in disclaimer_phrases_hindi:
        if answer.rstrip().endswith(phrase + '।') or answer.rstrip().endswith(phrase):
            return False, "Answer ends with disclaimer"
    
    if len(answer) > 100 and not answer.rstrip().endswith(('.', '।', '?', '!')):
        return False, "Answer appears incomplete"
    
    # Lower threshold - if no citations and answer mentions lack of info, it's insufficient
    if not citations or len(citations) == 0:
        if any(phrase in answer_lower for phrase in ['नहीं मिल', 'नहीं है', 'not found', 'not available']):
            return False, "No citations and mentions missing information"
    
    if citations and len(citations) > 0 and len(answer) > 300:
        return True, "Good KB answer with citations"
    
    if len(answer) > 250 and not any(phrase in answer_lower for phrase in insufficient_hindi + insufficient_english):
        return True, "Acceptable answer length without disclaimers"
    
    return False, "Answer quality uncertain - needs enhancement"

def call_bedrock_direct(question, language='en', subject='general'):
    """
    Call Bedrock directly
    Uses Nova Pro for all subjects now
    """
    
    model_id = BEDROCK_MODEL_ID
    
    system_prompts = {
        'hi': {
            'math': """आप NCERT कक्षा 7 गणित के लिए एक विशेषज्ञ शिक्षक हैं।

निर्देश:
- सरल और स्पष्ट हिंदी में उत्तर दें
- चरण-दर-चरण समाधान प्रदान करें
- उदाहरणों के साथ समझाएं
- सूत्र और नियम बताएं""",
            
            'general': """आप NCERT कक्षा 7 के लिए एक विशेषज्ञ शिक्षक हैं।
विषय: विज्ञान, सामाजिक विज्ञान, गणित, हिंदी, अंग्रेजी

निर्देश:
- सरल और स्पष्ट हिंदी में उत्तर दें
- NCERT पाठ्यक्रम के अनुसार जवाब दें
- उदाहरण और चरण-दर-चरण व्याख्या दें"""
        },
        
        'en': {
            'math': """You are an expert Math teacher for NCERT Class 7 students.

Instructions:
- Provide clear, step-by-step solutions
- Explain formulas and rules
- Use simple language suitable for Class 7
- Include examples when helpful""",
            
            'general': """You are an expert teacher for NCERT Class 7 students.
Subjects: Science, Social Science, Mathematics, Hindi, English

Instructions:
- Answer in clear, simple English
- Follow NCERT curriculum guidelines
- Provide examples and step-by-step explanations
- Describe diagrams or flowcharts when relevant"""
        }
    }
    
    lang_key = 'hi' if language == 'hi' else 'en'
    subject_key = 'math' if subject == 'math' else 'general'
    system_prompt = system_prompts[lang_key][subject_key]
    
    try:
        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": f"{system_prompt}\n\n{question}"
                        }
                    ]
                }
            ],
            "inferenceConfig": {
                "max_new_tokens": 2000,
                "temperature": 0.7
            }
        }
        
        print(f"Calling Bedrock {model_id} for {subject}...")
        
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        
        answer = None
        if 'output' in response_body and 'message' in response_body['output']:
            content = response_body['output']['message'].get('content', [])
            if content and len(content) > 0:
                answer = content[0].get('text', '')
        
        if answer:
            print(f"✓ Bedrock {model_id} returned answer (length: {len(answer)})")
            return answer, True
        else:
            print(f"✗ Could not extract answer from response")
            return None, False
            
    except Exception as e:
        error_msg = str(e)
        print(f"Bedrock direct error: {error_msg}")
        
        if 'AccessDeniedException' in error_msg:
            return "Model access not enabled. Please check Bedrock console.", False
        elif 'ThrottlingException' in error_msg:
            return "Too many requests. Please try again in a moment.", False
        else:
            return None, False

def enhance_with_nova(question, partial_kb_answer, language='en'):
    """
    Use Nova Pro to enhance/complete a partial KB answer
    """
    
    if language == 'hi':
        enhancement_prompt = f"""यहाँ NCERT पाठ्यपुस्तक से आंशिक जानकारी है:
{partial_kb_answer}

कृपया इस प्रश्न का पूर्ण और विस्तृत उत्तर दें: {question}

निर्देश:
- ऊपर दी गई NCERT जानकारी का उपयोग करें
- कोई भी गायब विवरण या स्पष्टीकरण जोड़ें
- सरल और स्पष्ट हिंदी में उत्तर दें
- NCERT कक्षा 7 के स्तर के अनुसार उत्तर दें"""
    else:
        enhancement_prompt = f"""Here is partial information from NCERT textbook:
{partial_kb_answer}

Please provide a complete and detailed answer to: {question}

Instructions:
- Use the NCERT information provided above
- Add any missing details or explanations
- Answer in clear, simple English
- Keep it appropriate for NCERT Class 7 level"""
    
    answer, success = call_bedrock_direct(enhancement_prompt, language, 'general')
    
    if success and answer:
        print(f"✓ Nova Pro enhanced the KB answer")
        return answer, True
    else:
        print(f"✗ Nova Pro enhancement failed, using KB answer")
        return partial_kb_answer, False

def query_knowledge_base(question, language='en'):
    """
    Query Bedrock Knowledge Base
    Returns: (answer_text, citations, success, needs_enhancement)
    """
    try:
        if language not in ['en', 'hi']:
            question_for_kb = translate_text(question, language, 'en')
        else:
            question_for_kb = question
        
        print(f"Querying Knowledge Base with: {question_for_kb[:100]}...")
        
        response = bedrock_agent_runtime.retrieve_and_generate(
            input={
                'text': question_for_kb
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': f'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0'
                }
            }
        )
        
        if 'output' in response and 'text' in response['output']:
            answer = response['output']['text']
            
            citations = []
            if 'citations' in response:
                for citation in response['citations']:
                    if 'retrievedReferences' in citation:
                        for ref in citation['retrievedReferences']:
                            if 'location' in ref and 's3Location' in ref['location']:
                                citations.append(ref['location']['s3Location'].get('uri', ''))
            
            print(f"✓ Knowledge Base returned answer (length: {len(answer)})")
            
            is_sufficient, reason = is_answer_sufficient(answer, citations)
            print(f"Answer quality check: {is_sufficient} - {reason}")
            
            if is_sufficient:
                return answer, citations, True, False
            else:
                return answer, citations, True, True
        else:
            print("✗ Knowledge Base returned no answer")
            return None, [], False, True
            
    except Exception as e:
        print(f"Knowledge Base error: {str(e)}")
        return None, [], False, True

def get_ai_answer(question, language):
    """
    Hybrid approach with KB enhancement
    """
    
    print(f"\n{'='*60}")
    print(f"Processing question in language: {language}")
    original_language = language
    
    subject = detect_subject(question)
    print(f"Detected subject: {subject}")
    
    if language not in ['en', 'hi']:
        print(f"Translating from {language} to English for processing...")
        question_english = translate_text(question, language, 'en')
        processing_language = 'en'
    else:
        question_english = question
        processing_language = language
    
    answer = None
    source = 'error'
    
    if subject == 'math':
        print("→ Using Nova Pro for Math")
        
        if original_language not in ['en', 'hi']:
            answer, success = call_bedrock_direct(question_english, 'en', 'math')
            if success and answer:
                answer = translate_text(answer, 'en', original_language)
                source = 'nova_math'
        else:
            answer, success = call_bedrock_direct(question, original_language, 'math')
            if success and answer:
                source = 'nova_math'
    
    else:
        print("→ Using Knowledge Base for Science/Social/English")
        
        kb_answer, citations, kb_success, needs_enhancement = query_knowledge_base(question_english, processing_language)
        
        if kb_success and kb_answer:
            
            if needs_enhancement:
                print("→ KB answer needs enhancement, calling Nova Pro...")
                
                enhanced_answer, enhancement_success = enhance_with_nova(
                    question_english, 
                    kb_answer, 
                    processing_language
                )
                
                if enhancement_success:
                    answer = enhanced_answer
                    source = 'kb_enhanced'
                else:
                    answer = kb_answer
                    source = 'knowledge_base_partial'
            else:
                answer = kb_answer
                source = 'knowledge_base'
            
            if original_language != processing_language:
                answer = translate_text(answer, processing_language, original_language)
        
        else:
            print("→ KB failed completely, falling back to Nova Pro")
            
            if original_language not in ['en', 'hi']:
                answer, success = call_bedrock_direct(question_english, 'en', 'general')
                if success and answer:
                    answer = translate_text(answer, 'en', original_language)
                    source = 'nova_fallback'
            else:
                answer, success = call_bedrock_direct(question, original_language, 'general')
                if success and answer:
                    source = 'nova_fallback'
    
    if not answer:
        answer = "Unable to generate answer. Please try again or contact your teacher."
        source = 'error'
    
    print(f"✓ Final answer source: {source}")
    print(f"{'='*60}\n")
    
    return answer, source, subject

def create_response(status_code, body):
    """Helper to create API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(body, ensure_ascii=False)
    }


def handle_ask_doubt(body):
    """Handle POST /doubts"""
    try:
        student_id = body.get('studentId')
        question = body.get('question')
        
        if not student_id or not question:
            return create_response(400, {
                'error': 'studentId and question are required'
            })
        
        doubt_id = f"DBT-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.utcnow().isoformat()
        
        language = detect_language(question)
        
        ai_answer, source, subject = get_ai_answer(question, language)
        
        table.put_item(
            Item={
                'doubtId': doubt_id,
                'studentId': student_id,
                'question': question,
                'aiAnswer': ai_answer,
                'language': language,
                'subject': subject,
                'answerSource': source,
                'status': 'answered',
                'timestamp': timestamp,
                'createdAt': timestamp
            }
        )
        
        return create_response(200, {
            'doubtId': doubt_id,
            'answer': ai_answer,
            'language': language,
            'subject': subject,
            'source': source,
            'timestamp': timestamp
        })
        
    except Exception as e:
        print(f"Error in handle_ask_doubt: {str(e)}")
        import traceback
        traceback.print_exc()
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def handle_flag_doubt(body):
    """Handle POST /doubts/flag"""
    try:
        doubt_id = body.get('doubtId')
        student_id = body.get('studentId')
        flag_reason = body.get('reason', 'Student requested review')
        
        if not doubt_id or not student_id:
            return create_response(400, {
                'error': 'doubtId and studentId are required'
            })
        
        timestamp = datetime.utcnow().isoformat()
        
        table.update_item(
            Key={
                'doubtId': doubt_id,
                'studentId': student_id
            },
            UpdateExpression='SET #status = :status, flagReason = :reason, flaggedAt = :timestamp',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'flagged',
                ':reason': flag_reason,
                ':timestamp': timestamp
            }
        )
        
        return create_response(200, {
            'message': 'Doubt flagged for teacher review',
            'doubtId': doubt_id,
            'status': 'flagged',
            'flaggedAt': timestamp
        })
        
    except Exception as e:
        print(f"Error in handle_flag_doubt: {str(e)}")
        return create_response(500, {
            'error': 'Failed to flag doubt',
            'message': str(e)
        })

def handle_get_flagged_doubts(params):
    """Handle GET /doubts/flagged - Filter by teacher's subjects"""
    try:
        teacher_id = params.get('teacherId') if params else None
        
        if not teacher_id:
            return create_response(400, {
                'error': 'teacherId is required'
            })
        
        # Get teacher's subjects
        users_table = dynamodb.Table('Users')
        
        try:
            teacher_response = users_table.get_item(Key={'userId': teacher_id, 'role': 'teacher'})
            teacher_data = teacher_response.get('Item', {})
            teacher_subjects = teacher_data.get('subjectSpecialization', [])
            
            print(f"Teacher {teacher_id} teaches: {teacher_subjects}")
        except Exception as e:
            print(f"Error fetching teacher data: {str(e)}")
            return create_response(500, {
                'error': 'Failed to fetch teacher information'
            })
        
        # Get all flagged doubts
        response = table.scan(
            FilterExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'flagged'}
        )
        
        all_flagged_doubts = response.get('Items', [])
        
        # Filter by subject only
        filtered_doubts = []
        for doubt in all_flagged_doubts:
            doubt_subject = doubt.get('subject', 'general')
            
            # Match if doubt subject contains teacher's subject or vice versa
            subject_match = any(
                teacher_subj.lower() in doubt_subject.lower() or 
                doubt_subject.lower() in teacher_subj.lower()
                for teacher_subj in teacher_subjects
            )
            
            if subject_match:
                filtered_doubts.append({
                    'doubtId': doubt.get('doubtId'),
                    'studentId': doubt.get('studentId'),
                    'question': doubt.get('question'),
                    'aiAnswer': doubt.get('aiAnswer'),
                    'teacherResponse': doubt.get('teacherResponse'),
                    'language': doubt.get('language'),
                    'subject': doubt_subject,
                    'answerSource': doubt.get('answerSource', 'unknown'),
                    'flagReason': doubt.get('flagReason', 'No reason provided'),
                    'flaggedAt': doubt.get('flaggedAt'),
                    'timestamp': doubt.get('timestamp')
                })
        
        return create_response(200, {
            'count': len(filtered_doubts),
            'doubts': filtered_doubts
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {
            'error': 'Failed to fetch flagged doubts',
            'message': str(e)
        })
def handle_get_student_doubts(params):
    """Handle GET /doubts/student - Get all doubts for a specific student"""
    try:
        student_id = params.get('studentId') if params else None
        
        if not student_id:
            return create_response(400, {'error': 'studentId is required'})
        
        # Query using existing StudentIndex GSI
        response = table.query(
            IndexName='StudentIndex',
            KeyConditionExpression=Key('studentId').eq(student_id),
            ScanIndexForward=False  # Newest first
        )
        
        doubts = response.get('Items', [])
        
        formatted_doubts = []
        for doubt in doubts:
            formatted_doubts.append({
                'doubtId': doubt.get('doubtId'),
                'question': doubt.get('question'),
                'aiAnswer': doubt.get('aiAnswer'),
                'teacherResponse': doubt.get('teacherResponse'),
                'status': doubt.get('status'),
                'subject': doubt.get('subject', 'general'),
                'language': doubt.get('language', 'en'),
                'timestamp': doubt.get('timestamp'),
                'resolvedAt': doubt.get('resolvedAt'),
                'flaggedAt': doubt.get('flaggedAt')
            })
        
        return create_response(200, {
            'count': len(formatted_doubts),
            'doubts': formatted_doubts
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return create_response(500, {
            'error': 'Failed to fetch student doubts',
            'message': str(e)
        })

def handle_resolve_doubt(body):
    """Handle POST /doubts/resolve"""
    try:
        doubt_id = body.get('doubtId')
        student_id = body.get('studentId')
        teacher_id = body.get('teacherId')
        teacher_response = body.get('teacherResponse')  # Changed from teacherFeedback
        
        if not doubt_id or not student_id or not teacher_id:
            return create_response(400, {
                'error': 'doubtId, studentId, and teacherId are required'
            })
        
        timestamp = datetime.utcnow().isoformat()
        
        # Change status from 'flagged' to 'resolved' so it disappears from all dashboards
        table.update_item(
            Key={
                'doubtId': doubt_id,
                'studentId': student_id
            },
            UpdateExpression='SET #status = :status, teacherResponse = :response, resolvedBy = :teacherId, resolvedAt = :timestamp',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'resolved',  # Changed from 'answered'
                ':response': teacher_response,
                ':teacherId': teacher_id,
                ':timestamp': timestamp
            }
        )
        
        return create_response(200, {
            'message': 'Doubt resolved successfully',
            'doubtId': doubt_id,
            'status': 'resolved',
            'resolvedAt': timestamp
        })
        
    except Exception as e:
        print(f"Error in handle_resolve_doubt: {str(e)}")
        return create_response(500, {
            'error': 'Failed to resolve doubt',
            'message': str(e)
        })
# ============== MAIN LAMBDA HANDLER ==============

def lambda_handler(event, context):
    """Main Lambda handler with routing"""
    
    print(f"Event received: {json.dumps(event)}")
    
    if event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight'})
    
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    body = {}
    if http_method == 'POST' and event.get('body'):
        try:
            body = json.loads(event['body'])
        except:
            return create_response(400, {'error': 'Invalid JSON'})
    
    params = event.get('queryStringParameters')
    
    try:
        if http_method == 'POST' and path.endswith('/doubts'):
            return handle_ask_doubt(body)
        
        elif http_method == 'POST' and '/flag' in path:
            return handle_flag_doubt(body)
        
        elif http_method == 'GET' and '/flagged' in path:
            return handle_get_flagged_doubts(params)
        
        elif http_method == 'POST' and '/resolve' in path:
            return handle_resolve_doubt(body)
        # In lambda_handler, add this route:
        elif http_method == 'GET' and '/student' in path:
            return handle_get_student_doubts(params)
        else:
            return create_response(404, {
                'error': 'Route not found',
                'path': path,
                'method': http_method
            })
    
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        import traceback
        traceback.print_exc()
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })
