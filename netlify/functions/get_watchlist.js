// /.netlify/functions/get_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {
  console.log("Hello from the backend")

  let db = firebase.firestore()  
  
  // Empty array for data to pushed into 
  let watchlistedStocksData = []  

    let userId = event.queryStringParameters.userId
    // console.log(`the user ID is ${event.queryStringParameters.user.uid}`)

    // let queryStringUserId = event.queryStringParameters.user.uid

 
      let watchlistedStocksQuery = await db.collection('userwatchlist').where('userId', '==', `${userId}`).get()
                              
      let watchlistedStocks = watchlistedStocksQuery.docs // stores all the watchlisted stocks in a variable  
      // console.log(watchlistedStocks)                   

      for(let i = 0; i < watchlistedStocks.length; i++)  {
        let docId = watchlistedStocks[i].id
        let doc = watchlistedStocks[i].data()

        // Creating objects to push data from firestore into the array
        watchlistedStocksData.push({
          Id: docId,
          stockSymb: doc.stockSymb,
          lastestPrice: doc.lastestPrice
        })
      } 

  return {
    statusCode: 200,
    body: JSON.stringify(watchlistedStocksData)

  }
}