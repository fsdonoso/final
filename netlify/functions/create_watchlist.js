// /.netlify/functions/create_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()

  let body = JSON.parse(event.body)
  
  let userId = body.userId
  let stockSymb = body.stockSymb
  let lastestPrice = body.lastestPrice

  await db.collection('userwatchlist').doc(`${userId}-${stockSymb}`).set({
    userId: userId, 
    stockSymb: stockSymb,
    lastestPrice: lastestPrice,
    created: firebase.firestore.FieldValue.serverTimestamp()
  })


  return {
    statusCode: 200,
    body: ''
  }

}