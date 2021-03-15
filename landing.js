

let apiKey        = '1a84597ee67f7b6234b19dcda5a1e678'

firebase.auth().onAuthStateChanged(async function(user) {
   
let db = firebase.firestore()     



// USER SIGNED IN 
if (user) {
      
      // Signed in
      console.log('signed in')
      console.log(user.uid)
      console.log(user.displayName)
      console.log(user.email)
      
      // Add to user collection
      db.collection('users').doc(user.uid).set({
        name: user.displayName,
        email: user.email
      })

      //Show Current user on screen
      let loggedinUser = user.displayName
      
      document.querySelector('#usr').insertAdjacentHTML('beforeend', `
      <span class="font-bold text-xl">Welcome back, ${loggedinUser}!</span>
      `)

      // Show email on screen
      document.querySelector('#eml').innerHTML = user.email;
      
     // Sign-out button 
     document.querySelector('.sign-in-or-sign-out').innerHTML = `
     <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Out</button>`
     document.querySelector('.sign-in-or-sign-out').addEventListener('click', function(event) {
     console.log('sign out clicked')
     firebase.auth().signOut()
     document.location.href = 'index.html'
     })
    


    // // listen for the post comment button and add it to database as well as to website 
    // let commentButton = document.querySelector("#comment-button")

    // commentButton.addEventListener('click', async function(event) {
    // event.preventDefault()
    // console.log(`comment button clicked!`)
    
    // // get the text of comment
    // let inputVal = document.querySelector("comment-button").value
    // console.log(inputVal)
    // let newCommentText = inputVal.value


    //     // Store comment in variable
    //     let newComment = {
    //       text: newCommentText
    //     }

    //  // call  back-end lambda using the new comment's data
    //  await fetch('/.netlify/functions/create_comment', {
    //   method: 'POST',
    //   body: JSON.stringify(newComment)
    // })

    //  // insert the new comment into the DOM, in the div with the class name "comments", for this post
    //  let commentsElement = document.querySelector("#comments")
    //  commentsElement.insertAdjacentHTML('beforeend', `
    //  <div class="bg-gray-100 rounded border border-gray-400 w-full bg-white border rounded-lg px-4 mb-4 italic"></div>${newComment}</div>
    //  `)
    // })



    // Get stock data
    let response = await fetch(`https://api.marketstack.com/v1/tickers?access_key=1a84597ee67f7b6234b19dcda5a1e678&exchange=XNAS`)
    let jsonStocks = await response.json()
    let stock = jsonStocks.data

      //LOCALLY DEFINED - HOW DO I GET THEM TO BE GLOBAL? 
      //loop through stock/tickers array
      for (let i=0; i<stock.length; i++) {
        let stk_name = stock[i].name
        let stk_symb = stock[i].symbol
        let price = stk_symb.close

      // Populate watchlist - LAMBDA
                 let stockAlreadyWatchlisted =  await db.collection('userwatchlist').doc(`${user.uid}-${stk_symb}`).get()

                      // let response = await fetch(`/.netlify/functions/get_watchlist?userId=${user.uid}`)
                      // let listed = await response.json()
                      // console.log(listed)
  

                                          if (stockAlreadyWatchlisted.exists) {
                                                // console.log(`${stockAlreadyWatchlisted} appened watchlisted`)
                                                //Append stock to the watchlist when page is loaded
                                                document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
                                                      <div id="watchlist-element-${user.uis}-${stk_symb}" class="md:w-full xl:w-1/3">
                                                      <div class="bg-white rounded-md flex flex-1 items-center p-4 w-full">

                                                      <div class="xl:px-3">
                                                            <button id="button-watchlist-element-${user.uid}-${stk_symb}" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                            </button>
                                                      </div>
                                                          
                                                      <div class="w-full xl:px-3">
                                                                      <p id="stock-userId-markedId" class="font-semibold text-xl">${stk_name}</p>
                                                                      </div>
                                                                      <span id="price-userId-markedId" class="text-blue-500 font-semibold text-lg">${stk_symb}</span>
                                                                    </div>
                                                      </div>        
                                                    `)
                                                  } else {
                                                    console.log(`Not yet watchlisted`)
                                                  }   
        //append to tickername select control.
        document.querySelector('#tickername').insertAdjacentHTML('beforeend', `<option data-tick="" value="${stk_symb}">${stk_name}</option>`)
      }






    //trigger change event in order to retrieve its corresponding data (latest price, latest price date)
    //See: selTickers.addEventListener
    document.querySelector("#tickername").dispatchEvent(new Event("change"));
    
    let selTickers  = document.querySelector("#tickername");
    
    selTickers.addEventListener('change', async function(event) {
      document.querySelector('#ticker').innerHTML = "";
      document.querySelector('#exchange').innerHTML = "";
      document.querySelector('#currency').innerHTML = "";

      var nomtick = this.options[this.selectedIndex].value;
      console.log(nomtick) 

      // var optionCurr    = nomtick.options.getAttribute("data-curr");
      // var optionExch    = nomtick.options.getAttribute("data-acro");
      // console.log(nomtick)

      //Get nomtick/acronym to call API Endpoint of the latest price/date
      let response = await fetch(`https://api.marketstack.com/v1/eod/latest?access_key=${apiKey}&symbols=${nomtick}`)
      let json = await response.json()
      let deod = json.data[0];
      var precioEOD   = Math.round((deod.close)*100) / 100;

      var fecha = new Date(deod.date);
      var fechaEOD    = getFormattedDate(fecha);
      console.log(precioEOD)

      var name = deod.exchange

      var exchan = deod.exchange

      //Write Values obtained from API in cells
      document.querySelector('#latestprice').innerHTML = "$" + precioEOD;
      document.querySelector('#latestpricedate').innerHTML = fechaEOD;
      document.querySelector('#ticker').innerHTML = nomtick;
      document.querySelector('#exchange').innerHTML = exchan;
      document.querySelector('#currency').innerHTML = "USD";


      // Add event listener to the watch-list button
                    document.querySelector('#watchlist-button').addEventListener('click', async function(event) {
                     event.preventDefault()
                                                      
                      let stockAlreadyWatchlisted =  await db.collection('userwatchlist').doc(`${user.uid}-${nomtick}`).get()
                      console.log(stockAlreadyWatchlisted)   

                          if (stockAlreadyWatchlisted.exists) {
                              console.log(`${stockAlreadyWatchlisted} already watchlisted`)
                          } else {

                                // LAMBDA Add stock to the user-specific userwatchlist and add HTML accordingly
                                
                                // let response = await fetch('/.netlify/functions/create_watchlist', {
                                //   method: 'POST',
                                //   body: JSON.stringify({
                                //     userId: user.uid, 
                                //     stockSymb: nomtick,
                                //     lastestPrice: precioEOD,
                                //     lastestDate: fechaEOD
                                //   })
                                // })
                                // let watchlistfetched = await response.json()

                                await db.collection('userwatchlist').doc(`${user.uid}-${nomtick}`).set({
                                  userId: user.uid, 
                                  stockSymb: nomtick,
                                  lastestPrice: precioEOD,
                                  lastestDate: fechaEOD
                                })

                                
                              document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
                                          <div id="watchlist-element-${user.uid}-${nomtick}" class="md:w-full xl:w-1/3">
                                          <div class="bg-white rounded-md items-center p-4">

                                          <div class="xl:px-3">
                                                <button id="button-watchlist-element-${user.uid}-${nomtick}" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                </button>
                                          </div>
                                              
                                          <div class="w-full xl:px-3">
                                                          <p class="font-semibold text-xl">${nomtick}</p>
                                                          </div>
                                                          <span class="text-blue-500 font-semibold text-lg">$${precioEOD}</span>
                                                        </div>
                                          </div>        
                                        `)

                            }                    
                      })

                      // document.querySelector(`#button-watchlist-element-${user.uid}-${nomtick}`).addEventListener('click', async function(event) {
                      //   event.preventDefault()
                      //   console.log('UN-watchlist button was clicked')   
                      //   await db.collection('userwatchlist').doc(`${user.uid}-${nomtick}`).delete()
                      //   console.log(`watchlist-element-${user.uid}-${nomtick}`)
                      //   document.querySelector(`button-watchlist-element-${user.uid}-${nomtick}`).classList.add('opacity-20')
                      // })
         
                      

                       // Add event Listener to Get button
                      let btnCalc = document.querySelector("#calc");
                      btnCalc.addEventListener('click', async function(event) {
                        event.preventDefault()
                        console.log("getbutton was clicked")

                        let inidate = document.querySelector('#dtinidate');
                        let enddate = document.querySelector('#dtenddate');
                        console.log(inidate)
                        console.log(enddate)
                        
                            // Calculations when Get button is clicked
                            if(inidate.value != "" && enddate.value != ""){
                              strIniDate = new Date(inidate.value.toString());
                              strEndDate = new Date(enddate.value.toString());
                              console.log(inidate.value)

                              //retrieve historical data from ticker
                              let response = await fetch(`https://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${nomtick}&date_from=${inidate.value}&date_to=${enddate.value}`)
                              let json = await response.json();
                              let hdeod = json.data;
                              console.log(hdeod)
                              
                              let min = 99999;
                              let max = 0;
                              let avg_tick = 0.0;
                              let chnge = 0;
                              //loop through array(json string)
                              for(let i=0;i<hdeod.length;i++){
                                //retrieve max close value
                                if(hdeod[i].close>max)
                                  max = hdeod[i].close;
                                //retrieve min close value
                                if(hdeod[i].close<min)
                                  min = hdeod[i].close;
                                //accumulate close values 
                                avg_tick = avg_tick + hdeod[i].close;
                              }


                              chnge = (hdeod[hdeod.length-1].close / hdeod[0].close)-1;
                              chnge =  Math.round((chnge*100)*100) / 100;
                              avg_tick = Math.round((avg_tick / hdeod.length) * 100) / 100;
                              
                              console.log(chnge)

                              document.querySelector('#avg').innerHTML = "$" + avg_tick;
                              document.querySelector('#perchange').innerHTML = chnge+"%";
                              document.querySelector('#min').innerHTML = "$" + min;
                              document.querySelector('#max').innerHTML = "$" + max;
                            
                              return false;

                            }else{
                              alert("Please pick a date range");
                              return false;
                            }

                          });



  //  // create a new Object to hold the comment's data
  //  let newComment = {
  //    postId: postId,
  //    username: firebase.auth().currentUser.displayName,
  //    text: newCommentText
  //  }

  //  // call our back-end lambda using the new comment's data
  //  await fetch('/.netlify/functions/create_comment', {
  //    method: 'POST',
  //    body: JSON.stringify(newComment)
  //  })








    })

            // //Get nomtick/acronym to call API Endpoint of the latest price/date
            // let response = await fetch(`http://api.marketstack.com/v1/eod/latest?access_key=3565d6cc3aa977584cb36ba340188d02&symbols=${nomtick}`)
            // let jsonStockData = await response.json()
            // let exchange = jsonStockData.data[0].exchange 
            // let closingPrice = jsonStockData.data[0].close
            // let close = jsonStockData.data[0].close
            // let closingPrice = Math.round((deod.close)*100) / 100;
            // var closingPriceformatted    = getFormattedDate(fecha)
            // console.log(closingPriceformatted)
         
          
                    // var elt        = document.getElementById('slExchange');
                    // var optionCurr    = elt.options[elt.selectedIndex].getAttribute("data-curr");
                    // var optionExch    = elt.options[elt.selectedIndex].getAttribute("data-acro");
              
              
                    //           //Add event listener to the watch-list button
                    //               document.querySelector('#watchlist-button').addEventListener('click', async function(event) {
                    //                   event.preventDefault()
                                                                    
                    //                 let stockAlreadyWatchlisted =  await db.collection('userwatchlist').doc(`${user.uid}-${nomtick_first_four}`).get()
                    //                 console.log(stockAlreadyWatchlisted)   
              
                    //                     if (stockAlreadyWatchlisted.exists) {
                    //                         console.log(`${stockAlreadyWatchlisted} already watchlisted`)
                    //                     } else {
              
                    //                           // Add stock to the user-specific userwatchlist and add HTML accordingly
                    //                           await db.collection('userwatchlist').doc(`${user.uid}-${nomtick_first_four}`).set({
                    //                             userId: user.uid,
                    //                             stockSymb: nomtick_first_four,
                    //                             lastestPrice: precioEOD,
                    //                             lastestDate: fechaEOD
                    //                           })
              
                                              
                    //                         document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
                    //                                     <div id="watchlist-element-${user.uid}-${nomtick_first_four}" class="md:w-full xl:w-1/3">
                    //                                     <div class="bg-white rounded-md items-center p-4">
              
                    //                                     <div class="xl:px-3">
                    //                                           <button id="button-watchlist-element-${user.uid}-${nomtick_first_four}" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    //                                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                    //                                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    //                                                       </svg>
                    //                                           </button>
                    //                                     </div>
                                                            
                    //                                     <div class="w-full xl:px-3">
                    //                                                     <p class="font-semibold text-xl">${nomtick_first_four}</p>
                    //                                                     </div>
                    //                                                     <span class="text-blue-500 font-semibold text-lg">$${precioEOD}</span>
                    //                                                   </div>
                    //                                     </div>        
                    //                                   `)
              
                    //                       }                    
                    //                 })
              
              
                    //                 document.querySelector(`#button-watchlist-element-${user.uid}-${nomtick_first_four}`).addEventListener('click', async function(event) {
                    //                   event.preventDefault()
                    //                   console.log('UN-watchlist button was clicked')   
                    //                   await db.collection('userwatchlist').doc(`${user.uid}-${nomtick_first_four}`).delete()
                    //                   console.log(`watchlist-element-${user.uid}-${nomtick_first_four}`)
                    //                   document.querySelector(`button-watchlist-element-${user.uid}-${nomtick_first_four}`).classList.add('opacity-20')
                    //                 })
                                                          
              
                    //           // // Second Firebase collection that records a stock's latest stock price and the latest price date if a user clicks on a "Record lastest stock price" button.  
                    //           // // The use case is if the user wants to view this specific stock price in the future (e.g. the last time I seriously looked at this stock, it was at this price).  
                    //           // // Add event listener to the "Record latest stock price" button 
                    //           // document.querySelector('#record-button').addEventListener('click', async function(event) {
                    //           // event.preventDefault()
                    //           // console.log('Record button was clicked')   
                          
                                      
                                
            



                  
                    
                    // // WATCHLIST enable watchlist functionality                                    
                    //                       // Check if this user has already bookmarked this stock 
                    //                       let stockAlreadyWatchlisted =  await db.collection('userwatchlist').doc(`${user.uid}-${stk_symb_first_four}`).get()
                    //                       // console.log(`${user.uid}-${stk_symb_first_four}`)
                    //                       // console.log(stockAlreadyWatchlisted)

                    //                       if (stockAlreadyWatchlisted.exists) {
                    //                             console.log(`${stockAlreadyWatchlisted} appened watchlisted`)
                    //                             //Append stock to the watchlist when page is loaded
                    //                             document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
                    //                                   <div id="watchlist-element-${user.uis}-${stk_symb_first_four}" class="md:w-full xl:w-1/3">
                    //                                   <div class="bg-white rounded-md flex flex-1 items-center p-4">

                    //                                   <div class="xl:px-3">
                    //                                         <button id="button-watchlist-element-${user.uid}-${stk_symb_first_four}" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    //                                                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                    //                                                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    //                                                     </svg>
                    //                                         </button>
                    //                                   </div>
                                                          
                    //                                   <div class="w-full xl:px-3">
                    //                                                   <p id="stock-userId-markedId" class="font-semibold text-xl">${stk_symb_first_four}</p>
                    //                                                   </div>
                    //                                                   <span id="price-userId-markedId" class="text-blue-500 font-semibold text-lg">$TBD</span>
                    //                                                 </div>
                    //                                   </div>        
                    //                                 `)
                    //                               } else {
                    //                                 console.log(`Not yet watchlisted`)
                    //                               }   
                    //   }

    //  })

    

      


 




  // Defining the Date function 
  function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return month + '/' + day + '/' + year;
  	}






  // USER SIGNED OUT
} else {
  window.location.href = "index.html";
  /*console.log('signed out')

  // Initializes FirebaseUI Auth
  let ui = new firebaseui.auth.AuthUI(firebase.auth())

  // FirebaseUI configuration
  let authUIConfig = {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    signInSuccessUrl: 'landing.html'
  }

  // Starts FirebaseUI Auth
  ui.start('.sign-in-or-sign-out', authUIConfig) */
}

})