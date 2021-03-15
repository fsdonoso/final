// /.netlify/functions/get_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {

console.log(`the user ID is ${event.queryStringParameters.userId}`)
let queryStringUserId = event.queryStringParameters.userId

  let db = firebase.firestore()                             // define a variable so we can use Firestore
  let watchlistedStocksData = []                                        // an empty Array
  
  let watchlistedStocksQuery = await db.collection('userwatchlist')     // watchlistedStocks from Firestore
                                        .where('userId', '==', queryStringUserId)                         
                                        .get()
  let watchlistedStocks = watchlistedStocksQuery.docs                 

  for(let i = 0; i<watchlistedStocks.length; i++)  {
    let watchlistedStockId = watchlistedStocks[i].userId
    let watchlistedStockTicker = watchlistedStocks[i].stockSymb
    let watchlistedStockPrice = watchlistedStocks[i].lastestPrice
    let watchlistedStockDate = watchlistedStocks[i].lastestDate

     watchlistedStocksData.push({
        userId: watchlistedStockId, 
        stockSymb: watchlistedStockTicker,
        lastestPrice: watchlistedStockPrice,
        lastestDate: watchlistedStockDate
    })

  } 

  return {
    statusCode: 200,
    body: JSON.stringify(watchlistedStocksData)

  }
}