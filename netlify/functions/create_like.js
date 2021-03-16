// /.netlify/functions/create_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()

  let body = JSON.parse(event.body)
  
  let likeId = body.likeId

  await db.collection('userwatchlist').doc(likeId).set({
  })


  return {
    statusCode: 200,
    body: ''
  }

}