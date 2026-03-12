# VoiceBot Backend

Backend service for an AI Voice Chatbot.

This server handles real-time communication between the client and AI services using WebSockets.

## Tech Stack

- Node.js
- Express.js
- Socket.io
- MongoDB (Mongoose)
- OpenAI (LLM)
- Speech-to-Text (STT)
- Text-to-Speech (TTS)

## Features

- Real-time chatbot communication
- Voice input processing
- AI response generation
- Text-to-speech output
- Conversation history storage
- Session-based chat system

## Project Structure

src
│
├── routes
│   ├── voice.routes.js
│   ├── outbound.routes.js
│   └── projects.routes.js
│
├── services
│   ├── stt.service.js
│   ├── tts.service.js
│   ├── llm.service.js
│   └── conversation.service.js
│
├── sockets
│   └── voice.socket.js
│
├── models
│   └── conversation.model.js
│
└── server.js

## Installation

Clone the repository

```bash
git clone https://github.com/Ahmedfci378/voiceBot.git
