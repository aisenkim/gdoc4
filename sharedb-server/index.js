const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const queryString = require("node:querystring")
const dotenv = require('dotenv')

ShareDB.types.register(require("rich-text").type);

const shareDBServer = new ShareDB();
const connection = shareDBServer.connect();

// GET FIRST DOCUMENT
// const shareDoc = connection.get('documents', "firstDocument");

// shareDoc.fetch((err) => {
//     if(err) throw err;
//     // IF NO DOC, CREATE NEW ONE AND ESTABLISH WS SERVER
//     if(shareDoc.type === null) {
//         shareDoc.create([], 'rich-text', () => {
//             const wsServer = new WebSocket.WebSocketServer({port : 8080})
//             wsServer.on('connection', (ws, incomingRequest) => {
//                 console.log("INCOMING REQUEST")
//                 console.log(incomingRequest)
//                 const jsonStream = new WebSocketJSONStream(ws);
//                 shareDBServer.listen(jsonStream);
//             })
//         })
//         console.log(shareDoc)
//         return;
//     }
// })

dotenv.config()


const PORT = process.env.PORT | 8080

const wsServer = new WebSocket.WebSocketServer({port: PORT})
wsServer.on('connection', (ws, req) => {
    console.log(`Connected on port: ${PORT}`)
    const docName = req.url.split("=")[1];
    const shareDoc = connection.get('documents', docName);
    shareDoc.fetch((err) => {
        console.log("CREATED")
        if (err) throw err;
        // IF NO DOC, CREATE NEW ONE AND ESTABLISH WS SERVER
        if (shareDoc.type === null) {
            console.log("Creating new doc")
            shareDoc.create([], 'rich-text', () => {
            })
        }
        // console.log("shareDoc: ")
        // console.log(shareDoc)
        const jsonStream = new WebSocketJSONStream(ws);
        shareDBServer.listen(jsonStream);
    })
})
