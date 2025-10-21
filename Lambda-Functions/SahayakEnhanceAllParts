import json
import boto3
import os
import re
from datetime import datetime

# Initialize clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Configuration
TABLE_NAME = 'sahayak-content'
KB_ID = 'EQUSJEXPFY'
NOVA_PRO = 'amazon.nova-pro-v1:0'
NOVA_LITE = 'amazon.nova-lite-v1:0'
NOVA_MICRO = 'amazon.nova-micro-v1:0'
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

table = dynamodb.Table(TABLE_NAME)

# ============ AGENTIC DECISION MAKING ============

def analyze_content_type(raw_content, summary):
    """
    AGENTIC: Agent autonomously decides what type of content this is
    and what enhancements are needed
    """
    prompt = f"""Analyze this Class 7 educational content and decide what enhancements it needs.

Content Summary: {summary}
Content Preview: {raw_content[:500]}

Decide:
1. Does this need a flow diagram? (yes/no)
2. What are the 2-3 main keywords for video search?
3. What type of questions work best? (scenario-based/conceptual/application)
4. Difficulty level needed? (basic/moderate/advanced)

Return JSON only:
{{"needs_diagram": true, "diagram_type": "process", "video_keywords": ["keyword1", "keyword2"], "question_type": "scenario", "difficulty": "moderate", "main_topic": "brief topic name"}}
"""

    body = json.dumps({
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        "inferenceConfig": {"max_new_tokens": 300, "temperature": 0.3}
    })
    
    try:
        response = bedrock_runtime.invoke_model(modelId=NOVA_MICRO, body=body)
        result = json.loads(response['body'].read())
        text = result['output']['message']['content'][0]['text']
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
            print(f"Agent analysis: {analysis}")
            return analysis
    except Exception as e:
        print(f"Content analysis failed: {e}")
    
    # Fallback
    return {
        "needs_diagram": False,
        "diagram_type": "none",
        "video_keywords": ["science", "class 7"],
        "question_type": "conceptual",
        "difficulty": "moderate",
        "main_topic": "general"
    }

# ============ KNOWLEDGE BASE QUERY ============

def query_knowledge_base(query_text, language='hindi'):
    """Query Bedrock Knowledge Base for NCERT context"""
    try:
        response = bedrock_agent.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={'text': f"{query_text} Class 7 NCERT {language}"},
            retrievalConfiguration={
                'vectorSearchConfiguration': {'numberOfResults': 3}
            }
        )
        
        contexts = []
        for result in response.get('retrievalResults', []):
            contexts.append({
                'text': result['content']['text'][:800],  # Reduced
                'score': result.get('score', 0)
            })
        
        print(f"KB found {len(contexts)} contexts")
        return contexts
    except Exception as e:
        print(f"KB query failed: {str(e)}")
        return []

# ============ CONTENT ENHANCEMENT (FIXED) ============

def enhance_content_with_nova(raw_content, kb_contexts, instructions, subject, language, content_analysis):
    """
    AGENTIC: Uses analysis to create targeted enhancement
    FIXED: Strict length control to prevent DynamoDB overflow
    """
    
    kb_text = "\n".join([f"[NCERT {i+1}]: {ctx['text'][:400]}" for i, ctx in enumerate(kb_contexts[:2])])
    
    # AGENTIC: Different prompts based on diagram needs
    if content_analysis['needs_diagram']:
        diagram_instruction = f"""
Create a SIMPLE {content_analysis['diagram_type']} diagram:
[DIAGRAM: {content_analysis['main_topic']}]
Step 1 -> Step 2 -> Step 3 (maximum 4 steps, one line each)
"""
    else:
        diagram_instruction = "No diagram needed for this content."
    
    diagram_section = "## Diagram\n[Simple flow]" if content_analysis['needs_diagram'] else ""
    
    prompt = f"""You are a Class 7 {subject} teacher. Create enhanced study material.

Original: {raw_content[:1800]}

NCERT Context: {kb_text}

Instructions: {instructions or "Clear and engaging"}
Language: {language}
Difficulty: {content_analysis['difficulty']}

CRITICAL RULES:
- Maximum 600 words total
- 2 real-world examples (Indian context)
- 4-5 key concepts (bullet points)
{diagram_instruction}
- Simple {language} (English terms OK)

Format:
## Content
[300-400 word explanation with 2 examples]

## Key Concepts
- Point 1
- Point 2
- Point 3
- Point 4

{diagram_section}
"""

    body = json.dumps({
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        "inferenceConfig": {
            "max_new_tokens": 1200,  # STRICT LIMIT
            "temperature": 0.7,
            "stopSequences": ["##END##"]  # Safety stop
        }
    })
    
    try:
        response = bedrock_runtime.invoke_model(modelId=NOVA_PRO, body=body)
        result = json.loads(response['body'].read())
        enhanced_text = result['output']['message']['content'][0]['text']
        
        # SAFETY: Truncate if too long (prevent DynamoDB overflow)
        if len(enhanced_text) > 3000:
            print(f"WARNING: Content too long ({len(enhanced_text)} chars), truncating")
            enhanced_text = enhanced_text[:3000] + "\n\n[Content truncated for size]"
        
        has_diagrams = '[DIAGRAM:' in enhanced_text and '→' in enhanced_text
        
        print(f"Enhanced: {len(enhanced_text)} chars, diagram: {has_diagrams}")
        
        return {
            'enhanced_text': enhanced_text,
            'has_diagrams': has_diagrams
        }
    except Exception as e:
        print(f"Enhancement failed: {str(e)}")
        return {'enhanced_text': raw_content[:2000], 'has_diagrams': False}

# ============ YOUTUBE SEARCH (FIXED) ============

def search_youtube_smart(content_analysis, subject, language='hindi', max_results=2):
    """
    AGENTIC: Uses AI-determined keywords for precise search
    FIXED: Better filtering and fallback
    """
    try:
        import requests
    except ImportError:
        print("Requests not available")
        return []
    
    if not YOUTUBE_API_KEY:
        print("No YouTube API key")
        return []
    
    # AGENTIC: Use AI-determined keywords
    keywords = ' '.join(content_analysis['video_keywords'][:2])
    
    # Build smart query
    if language == 'hindi':
        search_query = f"{keywords} {subject} कक्षा 7 NCERT"
    else:
        search_query = f"{keywords} {subject} class 7 NCERT"
    
    params = {
        'part': 'snippet',
        'q': search_query,
        'type': 'video',
        'videoDuration': 'medium',
        'maxResults': max_results + 3,  # Get extras to filter
        'key': YOUTUBE_API_KEY,
        'relevanceLanguage': 'hi' if language == 'hindi' else 'en',
        'safeSearch': 'strict',
        'order': 'relevance',
        'videoEmbeddable': 'true'
    }
    
    try:
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params=params,
            timeout=10
        )
        data = response.json()
        
        if 'error' in data:
            print(f"YouTube error: {data['error']['message']}")
            return get_fallback_videos(subject, language)
        
        videos = []
        primary_keyword = content_analysis['video_keywords'][0].lower()
        
        for item in data.get('items', []):
            video_id = item['id']['videoId']
            snippet = item['snippet']
            title = snippet['title'].lower()
            
            # FILTER: Check if title contains primary keyword or subject
            if primary_keyword in title or subject.lower() in title or 'class 7' in title:
                videos.append({
                    'title': snippet['title'],
                    'url': f"https://www.youtube.com/watch?v={video_id}",
                    'videoId': video_id,
                    'thumbnail': snippet['thumbnails']['medium']['url'],
                    'channelTitle': snippet['channelTitle']
                })
            
            if len(videos) >= max_results:
                break
        
        if not videos:
            print("No relevant videos found, using fallback")
            return get_fallback_videos(subject, language)
        
        print(f"Found {len(videos)} videos: {search_query}")
        return videos
    except Exception as e:
        print(f"YouTube search failed: {str(e)}")
        return get_fallback_videos(subject, language)

def get_fallback_videos(subject, language):
    """Fallback: Generic educational videos"""
    base_url = "https://www.youtube.com/watch?v="
    
    fallbacks = {
        'Science': {
            'hindi': [
                {'videoId': 'vIUL7DfuK9A', 'title': 'Science Class 7 NCERT', 'channelTitle': 'Magnet Brains'},
                {'videoId': 'F3KmF9vJmGQ', 'title': 'विज्ञान कक्षा 7', 'channelTitle': 'Dear Sir'}
            ],
            'english': [
                {'videoId': 'vIUL7DfuK9A', 'title': 'Science Class 7 NCERT', 'channelTitle': 'Magnet Brains'},
                {'videoId': 'F3KmF9vJmGQ', 'title': 'Science Grade 7', 'channelTitle': 'Khan Academy'}
            ]
        }
    }
    
    subject_fallbacks = fallbacks.get(subject, fallbacks['Science'])
    lang_videos = subject_fallbacks.get(language, subject_fallbacks['hindi'])
    
    return [
        {
            'title': v['title'],
            'url': base_url + v['videoId'],
            'videoId': v['videoId'],
            'thumbnail': f"https://i.ytimg.com/vi/{v['videoId']}/mqdefault.jpg",
            'channelTitle': v['channelTitle']
        }
        for v in lang_videos
    ]

# ============ QUESTION GENERATION (FIXED) ============

def generate_questions_smart(content, subject, language, content_analysis):
    """
    AGENTIC: Generates questions based on content analysis
    FIXED: Language-aware fallback
    """
    
    question_style = {
        'scenario': 'real-life situations',
        'conceptual': 'understanding of core concepts',
        'application': 'practical applications'
    }
    
    style = question_style.get(content_analysis['question_type'], 'understanding')
    
    prompt = f"""Create exactly 2 practice questions for Class 7 {subject} students.

Content: {content[:1000]}

Style: Focus on {style}
Difficulty: {content_analysis['difficulty']}
Language: {language}
Context: Indian students (12-13 years old)

Requirements:
- Questions in {language} language
- Real-world scenarios
- Critical thinking (not just recall)
- Age-appropriate

Format:
Question 1: [question in {language}]

Question 2: [question in {language}]
"""

    body = json.dumps({
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        "inferenceConfig": {"max_new_tokens": 500, "temperature": 0.8}
    })
    
    try:
        response = bedrock_runtime.invoke_model(modelId=NOVA_LITE, body=body)
        result = json.loads(response['body'].read())
        text = result['output']['message']['content'][0]['text']
        
        questions = re.findall(r'Question \d+:\s*(.+?)(?=Question \d+:|$)', text, re.DOTALL)
        questions = [q.strip() for q in questions[:2]]
        
        if len(questions) >= 2:
            print(f"Generated {len(questions)} questions")
            return questions
    except Exception as e:
        print(f"Question generation failed: {str(e)}")
    
    # FIXED: Language-aware fallback
    if language == 'hindi':
        return [
            "इस विषय को अपने दैनिक जीवन के उदाहरण से समझाइए।",
            "यदि आपको यह सिखाना हो तो आप किस तरीके से समझाएंगे?"
        ]
    else:
        return [
            "Explain this topic using an example from your daily life.",
            "How would you teach this concept to a younger student?"
        ]

# ============ MAIN HANDLER (AGENTIC ORCHESTRATION) ============

def lambda_handler(event, context):
    """
    AGENTIC: Autonomously decides processing strategy for each part
    """
    
    try:
        body = json.loads(event['body']) if 'body' in event else event
        
        content_id = body['contentId']
        subject = body.get('subject', 'Science')
        language = body.get('language', 'hindi')
        instructions = body.get('instructions', '')
        
        print(f"AGENTIC PROCESSING: {content_id}")
        
        # Get master record
        master_response = table.get_item(
            Key={'contentId': content_id, 'partNumber': 'MASTER'}
        )
        
        if 'Item' not in master_response:
            raise Exception(f"Content {content_id} not found")
        
        total_parts = int(master_response['Item']['totalParts'])
        successful_parts = 0
        failed_parts = []
        
        # Process each part with autonomous decision-making
        for part_num in range(1, total_parts + 1):
            part_key = f"PART-{part_num}"
            
            try:
                print(f"\n{'='*50}")
                print(f"PROCESSING {part_key}")
                print(f"{'='*50}")
                
                # Get part data
                part_response = table.get_item(
                    Key={'contentId': content_id, 'partNumber': part_key}
                )
                
                if 'Item' not in part_response:
                    print(f"⚠️  {part_key} not found, skipping")
                    failed_parts.append(part_key)
                    continue
                
                part_item = part_response['Item']
                raw_content = part_item.get('rawContent', '')
                summary = part_item.get('summary', '')
                
                if not raw_content:
                    print(f"⚠️  {part_key} has no content, skipping")
                    failed_parts.append(part_key)
                    continue
                
                # AGENTIC STEP 1: Analyze content type
                print("🤖 Agent analyzing content type...")
                content_analysis = analyze_content_type(raw_content, summary)
                
                # AGENTIC STEP 2: Query Knowledge Base
                print("🤖 Agent querying Knowledge Base...")
                kb_contexts = query_knowledge_base(
                    query_text=f"{subject} {content_analysis['main_topic']}",
                    language=language
                )
                
                # AGENTIC STEP 3: Enhance content
                print("🤖 Agent enhancing content...")
                enhanced = enhance_content_with_nova(
                    raw_content=raw_content,
                    kb_contexts=kb_contexts,
                    instructions=instructions,
                    subject=subject,
                    language=language,
                    content_analysis=content_analysis
                )
                
                # AGENTIC STEP 4: Find relevant videos
                print("🤖 Agent searching videos...")
                videos = search_youtube_smart(
                    content_analysis=content_analysis,
                    subject=subject,
                    language=language,
                    max_results=2
                )
                
                # AGENTIC STEP 5: Generate targeted questions
                print("🤖 Agent generating questions...")
                questions = generate_questions_smart(
                    content=enhanced['enhanced_text'],
                    subject=subject,
                    language=language,
                    content_analysis=content_analysis
                )
                
                # AGENTIC STEP 6: Store with metadata
                print("🤖 Agent storing enhanced content...")
                table.update_item(
                    Key={'contentId': content_id, 'partNumber': part_key},
                    UpdateExpression='''
                        SET enhancedContent = :content,
                            hasDiagrams = :diag,
                            videoLinks = :videos,
                            practiceQuestions = :questions,
                            kbSources = :kb,
                            contentAnalysis = :analysis,
                            #status = :status,
                            updatedAt = :time
                    ''',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={
                        ':content': enhanced['enhanced_text'],
                        ':diag': enhanced['has_diagrams'],
                        ':videos': videos,
                        ':questions': questions,
                        ':kb': [ctx.get('text', '')[:150] for ctx in kb_contexts],
                        ':analysis': content_analysis,
                        ':status': 'enhanced',
                        ':time': datetime.utcnow().isoformat()
                    }
                )
                
                successful_parts += 1
                print(f"✅ {part_key} completed successfully")
                
            except Exception as part_error:
                print(f"❌ {part_key} failed: {str(part_error)}")
                failed_parts.append(part_key)
                continue
        
        # Update master status
        if successful_parts > 0:
            table.update_item(
                Key={'contentId': content_id, 'partNumber': 'MASTER'},
                UpdateExpression='''
                    SET #status = :status,
                        successfulParts = :success,
                        failedParts = :failed,
                        updatedAt = :time
                ''',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'ready_for_preview' if successful_parts == total_parts else 'partially_complete',
                    ':success': successful_parts,
                    ':failed': failed_parts,
                    ':time': datetime.utcnow().isoformat()
                }
            )
        
        print(f"\n{'='*50}")
        print(f"AGENTIC PROCESSING COMPLETE")
        print(f"✅ Success: {successful_parts}/{total_parts}")
        if failed_parts:
            print(f"❌ Failed: {', '.join(failed_parts)}")
        print(f"{'='*50}\n")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'contentId': content_id,
                'status': 'ready_for_preview' if successful_parts == total_parts else 'partially_complete',
                'totalParts': total_parts,
                'successfulParts': successful_parts,
                'failedParts': failed_parts,
                'message': f'Enhanced {successful_parts}/{total_parts} parts successfully'
            })
        }
        
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': str(e),
                'message': 'Enhancement failed'
            })
        }
