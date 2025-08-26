document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('faceCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 300;

    // Face state
    let currentEmotion = 'neutral';
    let isSpeaking = false;
    let mouthProgress = 0;

    // Colors
    const bgColor = '#1E1E28';
    const faceColor = '#FFFFFF';

    // Connect to server
    const socket = io();

    // Emotion eye configurations
    const eyeConfig = {
        neutral: (ctx, x, y) => {
            ctx.beginPath();
            ctx.moveTo(x - 15, y);
            ctx.lineTo(x + 15, y);
            ctx.stroke();
        },
        happy: (ctx, x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 15, Math.PI, 0, false);
            ctx.stroke();
        },
        sad: (ctx, x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI, false);
            ctx.stroke();
        },
        angry: (ctx, x, y) => {
            ctx.beginPath();
            ctx.moveTo(x - 15, y - 15);
            ctx.lineTo(x + 15, y + 15);
            ctx.moveTo(x - 15, y + 15);
            ctx.lineTo(x + 15, y - 15);
            ctx.stroke();
        },
        surprise: (ctx, x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.stroke();
        }
    };

    function drawFace() {
        // Clear canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw eyes based on emotion
        ctx.strokeStyle = faceColor;
        ctx.lineWidth = 3;
        
        // Left eye
        eyeConfig[currentEmotion](ctx, width * 0.35, height * 0.4);
        
        // Right eye
        eyeConfig[currentEmotion](ctx, width * 0.65, height * 0.4);
        
        // Draw mouth
        ctx.beginPath();
        if (isSpeaking) {
            mouthProgress += 0.2;
            const segments = 8;
            for (let i = 0; i <= segments; i++) {
                const x = width * 0.3 + (width * 0.4 / segments) * i;
                const y = height * 0.7 + 10 * Math.sin(mouthProgress + i * 0.5);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        } else {
            ctx.moveTo(width * 0.3, height * 0.7);
            ctx.lineTo(width * 0.7, height * 0.7);
        }
        ctx.stroke();
        
        requestAnimationFrame(drawFace);
    }

    // Socket listeners
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('mouth', (data) => {
        isSpeaking = data.state === 'open';
    });

    socket.on('emotion', (data) => {
        currentEmotion = data.emotion || 'neutral';
    });

    socket.on('audio', (data) => {
        const audio = new Audio(data.url);
        audio.play().catch(e => console.error('Audio play failed:', e));
    });

    socket.on('error', (data) => {
        console.error('Server error:', data.message);
    });

    // Start animation
    drawFace();

    // Test button
    document.getElementById('speakBtn').addEventListener('click', () => {
        const text = document.getElementById('speechText').value || "Hello friend!";
        const emotion = document.getElementById('emotionSelect').value;
        socket.emit('speak', { text, emotion });
    });
});