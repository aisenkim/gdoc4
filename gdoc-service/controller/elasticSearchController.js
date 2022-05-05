const elasticSearch = require("elasticsearch");
const esClient = elasticSearch.Client({
    // host: "http://elasticsearch:9200"
    // host: "http://209.151.151.149"
    host: "https://elastic:dMmtWsO5I9nIHBN3dquUPzhD@gdoc.es.us-east-1.aws.found.io:9243"
})
// const  Client = require('@elastic/elasticsearch').Client
// const esClient = new Client({
//   cloud: { id: '90691e1ab0ef46259faad57b4bb8c498' },
//   auth: { apiKey: 'Mnh2NWdvQUJQVDFLVzJMOENIRXM6cDRXUk1OYzhTUi1sREstM1o2SXlWQQ==' }
// })

/**
 * @author - Aisen Kim
 * @brief - Returns an array of suggested word completions
 * @route - /index/suggest?q=...
 * @return - JSON array [strings, ...] ordered from the most relevant frist
 *
 *  Returns an array of suggested word completions starting with the queried prefix,
 *  sorted in descending order of relevant (at least one suggestion must be returned
 *  if any of the documents in the system include a word starting with the specified prefix). 
 *  The result is a JSON array [strings,...], ordered from the most relevant completion first. 
 *  The queried prefix is expected to be at least 4 letters long and the returned completions
 *  must be at least 1 character longer than the queried prefix.
 */
suggest = async (req, res) => {
    const searchText = req.query.q
    esClient.search({
        index: "gdoc",
        body: {
            suggest: {
                suggest: {
                    text: searchText.trim(),
                    term: {
                        field: "content"
                    }
                }
            }
        }
    })
        .then(response => {
            console.log(response)
            const resultArr = []
            const options = response.suggest.suggest[0].options
            console.log("OPTION IS-> ")
            console.log(options)
            if(options.length === 0) {
                return res.json(resultArr)
            }
            options.forEach(word=> {
                console.log(word)
                if(word.text.length > searchText.length){
                    resultArr.push(word.text)
                }
            })
            return res.json(resultArr)
        })
        .catch(err => {
            console.log(err)
            return res.json({
            error: true,
            message: `Query does not exist`,
            });
        })
}

/**
 * @author - Aisen Kim
 * @brief - Returns 10 documents that include the searched word in the document name or body
 * @route - index/search?q=...
 * @return - JSON array [{docid, name, snippet}, ...]
 *
 * Returns 10 documents that include the searched word in the document name or body as a
 * JSON array [{docid, name, snippet}, ...], ordered in descending order of relevance. 
 * The snippet is an excerpt from the document that surrounds the search phrase where
 * the search terms are surrounded with <em>...</em> markers. 
 * (Note: Don't forget to remove stop words and use stemming.)
 */
getDocEs = async (req, res) => {
    const searchText = req.query.q
    console.log(searchText)
    esClient.search({
        index: "gdoc",
        body: {
            size: 10,
            query: {
                // match: {"content": searchText.trim()}
                multi_match: {
                    query: searchText.trim(),
                    fields: ["content", "name"]
                }
            },
            highlight: {
                type: "unified",
                number_of_fragments: 5,
                fields: {
                    content: {}
                }
            }
        }
    })
        .then(response => {
            const resultArr = []
            // response.hits.hits -> array of matching object form
            console.log(response.hits.hits)
            console.log(response.hits.hits[0].highlight.content)
            console.log(response.hits.hits[0].highlight.content[0])
            response.hits.hits.forEach(hit => {
                // resultArr.push({docid: hit._id, name: hit._source.name, snippet: hit.highlight.content[0]})
                resultArr.push({docid: hit._id, name: hit._source.name, snippet: hit.highlight.content.join(' ')})
            })
            return res.json(resultArr)
        })
        .catch(err => {
            console.log(err)
            return res.json({
            error: true,
            message: `Query does not exist`,
            });
        })
}

createDocEs = async (id, name, content) => {
    console.log("ID: ", id);
    console.log(`Name: ${name}`);
    console.log(`Content is: ${content}`)
    try {
        let response = await esClient.index({
            index: 'gdoc',
            id: id,
            body: {
                "id": id,				// Doc id
                "name": name, 		// Doc Name
                "content": content		// Doc content
            }
        })
        console.log("After doc creation response is: ")
        console.log(response)
    } catch (err) {
        console.log(err)
        console.log("ERROR CREATING DOC IN ELASTIC SEARCH")
    }
}

/**
 * Make Post request
 */
createDocEsCall = async (req, res) => {
    const {id, name, content} = req.body;
    try {
        let response = await esClient.index({
            index: 'gdoc',
            id: id,
            body: {
                "id": id,				// Doc id
                "name": name, 		// Doc Name
                "content": content		// Doc content
            }
        })
    } catch (err) {
        console.log(err)
        console.log("ERROR CREATING DOC IN ELASTIC SEARCH")
    }
    return res.json({status: "OK"})
}

module.exports = {
    getDocEs,
    createDocEs,
    suggest,
    createDocEsCall
}
