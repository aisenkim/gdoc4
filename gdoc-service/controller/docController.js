const WebSocket = require("ws");
const Sharedb = require("sharedb/lib/client"); // for getting connections and docMap from index.js
const Document = require("../models/document");
const { v4: uuidv4 } = require("uuid");
const QuillDeltaToHtmlConverter =
  require("quill-delta-to-html").QuillDeltaToHtmlConverter;
const richText = require("rich-text");
const { stripHtml } = require("string-strip-html");
const { createDocEs } = require("./elasticSearchController");
const { setIntervalAsync } = require("set-interval-async/dynamic");
const Redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();

let connections = []; // for holding all current client connections
let docMap = new Map(); // keeping all the loaded document id's and document instance
let docVersion = new Map(); // key : docId and value : version (default to 1)
let docNameMap = new Map(); // map docid to doc name

const docUpdateSet = new Set(); // docs to update to elasticsearch

Sharedb.types.register(richText.type);

// ############## SHARE DB URL STORAGE RELATED ###############################

// ############## SHARE DB URL STORAGE RELATED ###############################

/**
 * Create a new document
 * @body - {name}
 * @return - {docid}
 */
createDoc = async (req, res) => {
  res.setHeader("X-CSE356", "61f9c246ca96e9505dd3f812");

  console.log(`In Create Doc localPort: " ${req.socket.localPort}`);

  // either 1 or 4
  const currentInstance = process.env.GDOC_SERVICE;

  const { name } = req.body;

  // CHECK IF EXISTS IN DB ELSE CREATE IT
  try {
    const document = await Document.findOne({ name });
    if (document)
      return res.json({
        error: true,
        message: "Document Already Exists",
        docid: document.docid,
      });
  } catch (err) {
    console.log("Document doesn't exist yet. CREATE ONE");
  }

  // AT THIS POINT, DOC DOESN'T EXIST BY THE NAME (MAX = 8)
  let newDocId = uuidv4(); // generate new id for doc
  const localPort = req.socket.localPort;
  if (localPort == 6000) {
    let endId = parseInt(currentInstance) + 0;
    console.log("endid: ", endId);
    newDocId = newDocId + endId;
  } else if (localPort == 6001) {
    let endId = parseInt(currentInstance) + 1;
    console.log("endid: ", endId);
    newDocId = newDocId + endId;
  } else if (localPort == 6002) {
    let endId = parseInt(currentInstance) + 2;
    console.log("endid: ", endId);
    newDocId = newDocId + endId;
  } else if (localPort == 6003) {
    let endId = parseInt(currentInstance) + 3;
    console.log("endid: ", endId);
    newDocId = newDocId + endId;
  } else if (localPort == 6004) {
    let endId = parseInt(currentInstance) + 4;
    console.log("endid: ", endId);
    newDocId = newDocId + endId;
  } else if(localPort == 6005) {
    newDocId = newDocId + "a"
  } else if(localPort == 6006) {
    newDocId = newDocId + "b"
  } else if(localPort == 6007) {
    newDocId = newDocId + "c"
  } else if(localPort == 6008) {
    newDocId = newDocId + "d"
  }
  console.log("new doc id: ", newDocId);
  // SET TO REDIS
  // await redisClient.set(newDocId, req.socket.localPort)
  // console.log(`Port is: ${req.socket.localPort}`)

  console.log("REQ.SOCKET.localPort = ", req.socket.localPort);
  let socket;
  if (localPort == 6000) {
    socket = new WebSocket(`ws://sharedb1:8080?document=${newDocId}`);
  } else if (localPort == 6001) {
    socket = new WebSocket(`ws://sharedb2:8081?document=${newDocId}`);
  } else if (localPort == 6002) {
    socket = new WebSocket(`ws://sharedb3:8082?document=${newDocId}`);
  } else if (localPort == 6003) {
    socket = new WebSocket(`ws://sharedb4:8083?document=${newDocId}`);
  } else if (localPort == 6004) {
    socket = new WebSocket(`ws://sharedb5:8084?document=${newDocId}`);
  } else if (localPort == 6005) {
    socket = new WebSocket(`ws://sharedb6:8085?document=${newDocId}`);
  } else if (localPort == 6006) {
    socket = new WebSocket(`ws://sharedb7:8086?document=${newDocId}`);
  } else if (localPort == 6007) {
    socket = new WebSocket(`ws://sharedb8:8087?document=${newDocId}`);
  } else if (localPort == 6008) {
    socket = new WebSocket(`ws://sharedb9:8088?document=${newDocId}`);
  }

  const connection = new Sharedb.Connection(socket);

  let doc = connection.get("documents", newDocId);
  doc.subscribe(async (err) => {
    if (err) throw err;
    // SAVE DOC TO MAP
    docMap.set(newDocId, doc);

    docNameMap.set(newDocId, name);

    // await redisClient.hmset(newDocId, {port: req.socket.localPort, doc: JSON.stringify(doc)})

    // set the doc version (DEFATULT 1)
    docVersion.set(newDocId, 1);

    // SAVE DOC TO DATABASE
    const savedDoc = await Document.create({
      docid: newDocId,
      name,
    });
    if (!savedDoc) {
      return res.json({
        error: true,
        message: "Document Already Exists",
        docid: newDocId,
      });
    }

    // // Save doc to redis instead of mongo
    // await redisLocal.lPush("recentDoc", [newDocId]);
    // // Map id : name
    // await redisLocal.set(newDocId, name);
  });

  return res.json({
    docid: newDocId,
  });
};

/**
 * Delete the doc
 * body - {docid}
 * return - {}
 */
// deleteDoc = async (req, res) => {
//   res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
//   const { docid } = req.body;
//   const doc = docMap.get(docid);
//   if (!doc)
//     return res.json({
//       error: true,
//       message: "Document by the id doesn't exist",
//     });
//   // delete it from the sharedb
//   doc.del((err) => {
//     console.log("Error Deleting Document");
//     console.log(err);
//   });
//   docMap.delete(docid); // delete from local copy
//   shareDbMap.delete(docid)
//   await Document.deleteOne({ docid }); // delte record from database
//
//   return res.json({
//     status: "OK",
//     message: `Successful in deleting the document of the id: ${docid}`,
//   });
// };
// Altered delete for script
deleteDoc = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
  const { docid } = req.body;
  // const isDoc = await redisClient.get(docid);

  try {
    let deleteCount = await Document.deleteOne({ docid }); // delte record from database
    if (deleteCount <= 0) {
      return res.json({
        error: true,
        message: "Document by the id doesn't exist",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      error: true,
      message: "Document by the id doesn't exist",
    });
  }

  const doc = docMap.get(docid);
  // if (!isDoc)
  //   return res.json({
  //     error: true,
  //     message: "Document by the id doesn't exist",
  //   });
  if (doc) {
    // delete it from the sharedb
    doc.del((err) => {
      console.log("Error Deleting Document");
      console.log(err);
    });
    docMap.delete(docid); // delete from local copy
    docNameMap.delete(docid);
    // shareDbMap.delete(docid)
  }
  // await redisClient.del(docid)
  return res.json({
    status: "OK",
    message: `Successful in deleting the document of the id: ${docid}`,
  });
};

/**
 * Get most-recently modified 10 documents
 * body - {}
 * return - [{id, name}]
 */
listDoc = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
  const documents = await Document.find().sort({ updatedAt: -1 }).limit(10);
  const list = [];
  documents.forEach((document) => {
    list.push({
      docid: document.docid,
      name: document.name,
    });
  });
  return res.json(list);
};

// ############################# /doc/ ROUTES ###########################################

/**
 * Start Delta event stream connection to server
 * GET request
 * @route - /doc/connect/DOCID/UID
 * @return - Delta event stream)
 */
getDocument = async (req, res) => {
  console.log("Inside /doc/connect/DOCID/UID");
  const docId = req.params.DOCID;
  const uid = req.params.UID; // generated from the client side

  res.header({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "*",
    Connection: "keep-alive",
    "X-CSE356": "61f9c246ca96e9505dd3f812",
    "X-Accel-Buffering": "no",
  });
  connections.push({ connectionId: uid, documentId: docId, res });

  // CHECK IF DOCUMENT HAS BEEN OPENED PREVIOUSLY
  const documentExists = docMap.has(docId);
  if (!documentExists) {
    return res.json({
      error: true,
      message: `Document by the id: ${docId} doesn't exist -> get document`,
    });
  }

  // UPDATE TO DB
  await Document.updateOne({ docid: docId });

  const localDoc = docMap.get(docId);

  // If doc locally exists
  const data = `data: ${JSON.stringify({
    content: localDoc.data.ops,
    version: localDoc.version,
  })}\n\n`;

  res.write(data);

  // req.on("close", () => {
  //     console.log("Connection Closed*************************")
  //     // ONLY REMOVE THE CLIENT THAT CLOSED THE BROWSER
  //     connections = connections.filter(connection => connection.connectionId !== uid);
  // })
};

/**
 * Submit a new Delta op for document with given version
 * @route - /doc/op/DOCID/UID
 * @body - {version, op}
 * @return - {status}
 */
submitDeltaOp = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");

  const docId = req.params.DOCID;
  const uid = req.params.UID; // generated from the client side

  // CHECK IF DOC EXISTS
  const currentDoc = docMap.get(docId);
  if (!currentDoc) {
    console.log("Inside Submit Op Error PORT = ", req.socket.localPort);
    return res.json({
      error: true,
      message: `Document by the id: ${docId} doesn't exist -> submit Op`,
    });
  }

  const localVersion = docVersion.get(docId);

  const { version, op } = req.body;

  // CHECK IF VERSION MATCH (SERVER'S VERSION AHEAD OF CLIENT)
  if (version && localVersion > version)
    return res.json({
      status: "retry",
    });

  currentDoc.submitOp(op);

  // INCREMENT THE LOCAL VERSION
  docVersion.set(docId, localVersion + 1);

  const returnObject = `data: ${JSON.stringify(op)}\n\n`;
  const returnAckObject = `data: ${JSON.stringify({ ack: op })}\n\n`;

  connections.forEach((connection) => {
    if (connection.documentId === docId && connection.connectionId !== uid) {
      connection.res.write(returnObject);
    }
    // IF THE USER WHO MADE THE REQUEST, SEND HIM THE {ack: op}
    else if (connection.connectionId === uid) {
      connection.res.write(returnAckObject);
    }
  });

  // Update ELastic Search
  // const contentStr = await getDocHtmlWithNoTag(docId);
  // await createDocEs(docId, docNameMap.get(docId), contentStr);
  docUpdateSet.add(docId);

  // UPDATE VERSION IN MONGODB (FOR LATER GETTING 10 MOST RECENT DOCS)
  // await Document.updateOne({ docid: docId }, { version });
  // await redisLocal.lPush("recentDoc", [docId]);

  return res.json({ status: "ok" });
};

setIntervalAsync(async () => {
  for (let docId of docUpdateSet) {
    const contentStr = await getDocHtmlWithNoTag(docId);
    await createDocEs(docId, docNameMap.get(docId), contentStr);
    docUpdateSet.delete(docId);
  }
}, 5000);

/**
 * req.body - { index, length }
 * return type - { presence: { id, cursor: { index, length, name } } }
 * id - uid
 * index - received index
 * length - received length
 * name - name of the user corresponding to the uid
 */
submitPresence = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");

  const docId = req.params.DOCID;
  const uid = req.params.UID; // generated from the client side
  const name = req.session.name; // name of the current user (from the cookie)

  // CHECK IF DOC EXISTS
  const currentDoc = docMap.get(docId);
  if (!currentDoc) {
    return res.json({
      error: true,
      message: `Document by the id: ${docId} doesn't exist -> submit Op`,
    });
  }

  const { index, length } = req.body;

  const returnPresence = `data: ${JSON.stringify({
    presence: { id: uid, cursor: { index, length, name } },
  })}\n\n`;

  connections.forEach((connection) => {
    if (connection.documentId === docId && connection.connectionId !== uid) {
      connection.res.write(returnPresence);
    }
  });

  // // UPDATE VERSION IN MONGODB (FOR LATER GETTING 10 MOST RECENT DOCS)
  // await Document.updateOne({docid: docId}, {version});

  return res.json({});
};

function getQuillConverter(doc) {
  const cfg = {};

  return new QuillDeltaToHtmlConverter(doc, cfg);
}

getDocHtml = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");

  const docId = req.params.DOCID;
  const uid = req.params.UID; // generated from the client side

  const doc = docMap.get(docId);

  if (!doc || !doc.data.ops) {
    return res.send("<p></p>");
  }

  await doc.fetch();

  const converter = getQuillConverter(doc.data.ops);

  const html = converter.convert();

  res.send(html);
};

getDocHtmlWithNoTag = async (docId) => {
  const doc = docMap.get(docId);

  if (!doc || !doc.data.ops) {
    return "";
  }

  // await doc.fetch();

  const converter = getQuillConverter(doc.data.ops);

  converter.afterRender(function (groupType, htmlString) {
    return stripHtml(htmlString).result;
  });

  const html = converter.convert();

  console.log("Converted html notag is -> ");
  console.log(html);

  return html;
};

module.exports = {
  createDoc,
  deleteDoc,
  listDoc,
  getDocument,
  submitDeltaOp,
  getDocHtml,
  submitPresence,
  getDocHtmlWithNoTag,
};
