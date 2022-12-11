import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import mongo from './mongo'
import server from './server'
import dotenv from 'dotenv-defaults'

mongo.connect();
/*
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connected!");
    wss.on('connection', (ws) => {
        // Define WebSocket connection logic
        console.log('Server connected');
        ws.box = '';
        ws.onmessage = wsConnect.onMessage(ws, wss); 
    });
});
*/
const port = process.env.PORT || 4000;
server.listen({port}, () => {
    console.log(`Listening on http://localhost:${port}`);
});
