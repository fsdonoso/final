// /.netlify/functions/get_watchlist
let firebase = require('./firebase')

exports.handler = async function(event) {

  let db = firebase.firestore()  
  
  // Empty array for data to pushed into 
  let likesData = []  
 
    let numberLikesQuery = await db.collection('likes').get()
                              
    let numberLikesDocs = numberLikesQuery.docs // stores all the watchlisted stocks in a variable                   

      for(let i = 0; i < numberLikesDocs.length; i++)  {
        let likeId = numberLikesDocs[i].id

        // Creating objects to push data from firestore into the array
        likesData.push({
        likeId: likeId,
        })

      } 

  return {
    statusCode: 200,
    body: JSON.stringify(likesData)

  }
}