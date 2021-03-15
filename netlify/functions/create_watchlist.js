// /.netlify/functions/create_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()

  let body = JSON.parse(event.body)
  console.log(event.body)
  
  let userId = body.userId
  let stockSymb = body.stockSymb
  let lastestPrice = body.lastestPrice
  let lastestDate = body.lastestDate

  console.log(`user: ${userId}`)
  console.log(`stock: ${stockSymb}`)

  let newWatchlistedStock = { 
    userId: user.uid, 
    stockSymb: nomtick,
    lastestPrice: precioEOD,
    lastestDate: fechaEOD,
    created: firebase.firestore.FieldValue.serverTimestamp()
  }

  let docRef = await db.collection('userwatchlist').add(newWatchlistedStock)
  newWatchlistedStock.id = docRef.id-nomtick
  console.log(newWatchlistedStock.id)

  return {
    statusCode: 200,
    body: JSON.stringify(newWatchlistedStock)
  }

}