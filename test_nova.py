import boto3, json
client = boto3.client('bedrock-runtime', region_name='ap-south-1')
response = client.invoke_model(
    modelId='apac.amazon.nova-micro-v1:0',
    body=json.dumps({
        'messages': [{'role': 'user', 'content': [{'text': 'Reply with only this JSON: {"grade": "B", "test": true}'}]}]
    })
)
print(json.loads(response['body'].read()))
