import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { GoogleGenAI } from "@google/genai";
import Speaker from "speaker";
import { Buffer } from "buffer";
import dotenv from 'dotenv';

// Suppress dotenv messages
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = function(chunk, encoding, fd) {
    const str = chunk && typeof chunk.toString === 'function' ? chunk.toString() : String(chunk);
    if (str.includes('[dotenv@') || str.includes('injecting env')) {
        return true; // Suppress dotenv messages
    }
    return originalStdoutWrite(chunk, encoding, fd);
};

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

// Suppress speaker warnings by intercepting stderr
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function(chunk, encoding, fd) {
    try {
        const str = chunk && typeof chunk.toString === 'function' ? chunk.toString() : String(chunk);
        if (str.includes('buffer underflow') || 
            str.includes('coreaudio.c') || 
            str.includes('mpg123') || 
            str.includes('Didn\'t have any audio data') ||
            str.includes('warning:') && (str.includes('deps/mpg123') || str.includes('output/coreaudio'))) {
            return true; // Suppress speaker library warnings
        }
    } catch (e) {
        // If conversion fails, allow through
    }
    return originalStderrWrite(chunk, encoding, fd);
};

class AudioManager {
    constructor(onStatusChange) {
        this.client = new GoogleGenAI({
            apiKey: API_KEY,
            apiVersion: "v1alpha",
        });
        this.session = null;
        this.speaker = null;
        this.onStatusChange = onStatusChange;
        this.isPlaying = false;
    }

    async connect() {
        if (!API_KEY) {
            this.onStatusChange('error');
            return;
        }

        try {
            this.onStatusChange('connecting');

            try {
                this.speaker = new Speaker({
                    channels: 2,
                    bitDepth: 16,
                    sampleRate: 48000,
                });
            } catch (err) {
                this.onStatusChange('error');
                return;
            }

            this.session = await this.client.live.music.connect({
                model: "models/lyria-realtime-exp",
                callbacks: {
                    onmessage: (message) => {
                        if (message.serverContent?.audioChunks) {
                            for (const chunk of message.serverContent.audioChunks) {
                                if (chunk.data && this.speaker) {
                                    try {
                                        const audioBuffer = Buffer.from(chunk.data, "base64");
                                        this.speaker.write(audioBuffer);
                                    } catch (writeErr) {
                                        // Silently handle write errors
                                    }
                                }
                            }
                        }
                    },
                    onerror: (error) => {
                        this.onStatusChange('error');
                    },
                    onclose: () => {
                        this.onStatusChange('disconnected');
                        this.isPlaying = false;
                    },
                },
            });

            this.onStatusChange('connected');

        } catch (err) {
            this.onStatusChange('error');
        }
    }

    async play(promptText) {
        if (!this.session) return;
        
        try {
            await this.session.setWeightedPrompts({
                weightedPrompts: [
                    { text: promptText, weight: 1.0 },
                ],
            });
            
            await this.session.setMusicGenerationConfig({
                musicGenerationConfig: {
                    bpm: 90,
                    temperature: 1.0,
                },
            });
            
            if (!this.isPlaying) {
                await this.session.play();
                this.isPlaying = true;
                this.onStatusChange('playing');
            }
        } catch (e) {
            this.onStatusChange('error');
        }
    }
    
    async updatePrompt(promptText) {
        if (!this.session) return;
        try {
            await this.session.setWeightedPrompts({
                weightedPrompts: [
                    { text: promptText, weight: 1.0 },
                ],
            });
        } catch(e) {
            // Silently handle errors
        }
    }

    async pause() {
        if (this.session && this.isPlaying) {
            await this.session.pause();
            this.isPlaying = false;
            this.onStatusChange('paused');
        }
    }
}

const App = () => {
    const { exit } = useApp();
    const [status, setStatus] = useState('initializing');
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [prompt, setPrompt] = useState('');
    const audioManagerRef = useRef(null);

    useEffect(() => {
        const manager = new AudioManager(setStatus);
        audioManagerRef.current = manager;
        manager.connect();
    }, []);

    useInput((input, key) => {
        if (key.ctrl && input === 'c') {
            exit();
        }
    });
    
    const handleSubmit = async (value) => {
        if (!value.trim()) return;
        
        if (audioManagerRef.current) {
            setCurrentPrompt(value);
            if (status === 'playing') {
                await audioManagerRef.current.updatePrompt(value);
            } else if (status === 'connected' || status === 'paused') {
                await audioManagerRef.current.play(value);
            }
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'playing': return 'green';
            case 'error': return 'red';
            case 'connected': return 'cyan';
            case 'connecting': return 'yellow';
            default: return 'gray';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'playing': return '▶';
            case 'paused': return '⏸';
            case 'connected': return '●';
            case 'connecting': return '⟳';
            case 'error': return '✗';
            default: return '○';
        }
    };

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">╭─ Lyria Playground ────────────────────────────────────────────╮</Text>
            </Box>
            
            <Box marginBottom={1} flexDirection="row" alignItems="center">
                <Text>Status: </Text>
                <Text color={getStatusColor()}>
                    {getStatusIcon()} {status}
                </Text>
            </Box>

            {currentPrompt && status === 'playing' && (
                <Box marginBottom={1}>
                    <Text color="gray">Now playing: </Text>
                    <Text color="white" italic>{currentPrompt}</Text>
                </Box>
            )}

            <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
                <Box marginRight={1}>
                    <Text color="cyan">→</Text>
                </Box>
                <TextInput 
                    value={prompt} 
                    onChange={setPrompt} 
                    onSubmit={handleSubmit} 
                    placeholder="Describe the music you want..."
                />
            </Box>
            
            <Box>
                <Text color="gray" dimColor>
                    {status === 'playing' 
                        ? 'Type a new prompt to steer the music • Ctrl+C to quit'
                        : status === 'connected'
                        ? 'Enter a prompt to start generating music • Ctrl+C to quit'
                        : 'Connecting to Lyria...'}
                </Text>
            </Box>
        </Box>
    );
};

render(<App />);
