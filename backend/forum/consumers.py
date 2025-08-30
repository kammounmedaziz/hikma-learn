import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Question, Answer, Comment
from .serializers import QuestionSerializer, AnswerSerializer, CommentSerializer

class ForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'forum_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': message_type,
                'data': text_data_json['data']
            }
        )
    
    # Handler for different message types
    async def new_question(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'new_question',
            'data': data
        }))
    
    async def new_answer(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'new_answer',
            'data': data
        }))
    
    async def new_comment(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'data': data
        }))
    
    async def answer_pinned(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'answer_pinned',
            'data': data
        }))