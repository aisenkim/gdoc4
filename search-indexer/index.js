const express = require("express");
const cors = require("cors")
const dotenv = require('dotenv')
const { setIntervalAsync } = require("set-interval-async/dynamic");
const elasticSearch = require("elasticsearch");
const esClient = elasticSearch.Client({
    host: "http://209.151.151.187:9200"
});
dotenv.config()

const app = express();
app.use(cors({
     origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json({limit:'50mb', extended:true}));

const requestQueue = []

app.post("/indexer", (req, res) => {
    const {queue} = req.body;
    requestQueue.push.apply(requestQueue, queue)
    return res.json({status: "OK"});
})

const createDocEs = async (id, name, content) => {
    console.log("ID: ", id);
    console.log(`Name: ${name}`);
    console.log(`Content is: ${content}`);
    try {
        let response = await esClient.index({
            index: "gdoc",
            id: id,
            body: {
                id: id, // Doc id
                name: name, // Doc Name
                content: content, // Doc content
            },
        });
        console.log("After doc creation response is: ");
        console.log(response);
    } catch (err) {
        console.log(err);
        console.log("ERROR CREATING DOC IN ELASTIC SEARCH");
    }
};

setIntervalAsync(async () => {
  for (let request of requestQueue) {
    await createDocEs(request.docId, request.docName, request.contentStr);
    requestQueue.shift();
  }
}, 1500);


// app.listen(PORT, () => {
//     console.log(`Connected on port: ${PORT}`)
// })
app.listen(process.env.PORT, () => {
    console.log(`Connected on port: ${process.env.PORT}`)
})
