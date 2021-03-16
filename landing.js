

let apiKey        = '1a84597ee67f7b6234b19dcda5a1e678'

firebase.auth().onAuthStateChanged(async function(user) {
   
let db = firebase.firestore()     



// USER SIGNED IN 
if (user) {
      
      //Signed in
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
  

    // Get stock data
    let response = await fetch(`https://api.marketstack.com/v1/tickers?access_key=1a84597ee67f7b6234b19dcda5a1e678&exchange=XNAS`)
    let jsonStocks = await response.json()
    let stock = jsonStocks.data

      //loop through stock/tickers array
      for (let i=0; i<stock.length; i++) {
        let stk_name = stock[i].name
        let stk_symb = stock[i].symbol
        let price = stk_symb.close

        //append to tickername select control.
        document.querySelector('#tickername').insertAdjacentHTML('beforeend', `<option data-tick="" value="${stk_symb}">${stk_name}</option>`)
      }
    

    // Get data for user-specific Watchlist and populate it to page
    let watchListQuery = await fetch(`/.netlify/functions/get_watchlist?userId=${user.uid}`)
    let listed = await watchListQuery.json()
    
    for(i=0; i < listed.length; i++){
      document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
          <div id="watchlist-element-${user.uid}-${listed[i].stockSymb}" class="md:w-full xl:w-1/3">
          <div class="bg-white rounded-md items-center p-4"">

          <div class="xl:px-3">
                <button id="button-watchlist-element-${user.uid}-${listed[i].stockSymb}" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                </button>
          </div>
              
          <div class="w-full xl:px-3">
                          <p id="stock-userId-markedId" class="font-semibold text-xl">${listed[i].stockSymb}</p>
                          </div>
                          <span id="price-userId-markedId" class="text-blue-500 font-semibold text-lg">${listed[i].lastestPrice}</span>
                        </div>
          </div>        
      `)
    }

   
    
  // Get data for Like-button
  let likeQuery = await fetch(`/.netlify/functions/get_like`)
  let likesFetched = await likeQuery.json()
  let numberLikes = likesFetched.length
  
  // Add # of Likes to Page
  document.querySelector('#likes').innerHTML = numberLikes;
    


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
      var fechaEOD  = getFormattedDate(fecha);
      console.log(precioEOD)

      var name = deod.exchange

      var exchan = deod.exchange

      //Write Values obtained from API in cells
      document.querySelector('#latestprice').innerHTML = "$" + precioEOD;
      document.querySelector('#latestpricedate').innerHTML = fechaEOD;
      document.querySelector('#ticker').innerHTML = nomtick;
      document.querySelector('#exchange').innerHTML = exchan;
      document.querySelector('#currency').innerHTML = "USD";

      let ticker = document.querySelector('#ticker').innerHTML
      let price = document.querySelector('#latestprice').innerHTML

      console.log(ticker)
      console.log(price)
      

  // Add event listener to the watch-list button
  document.querySelector('#watchlist-button').addEventListener('click', async function(event) {
    event.preventDefault()
        
    // LAMBDA Add stock to the user-specific userwatchlist and add HTML accordingly        
    let response = await fetch('/.netlify/functions/create_watchlist', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.uid, 
        stockSymb: ticker,
        lastestPrice: price
      })
    })
    
    // Add watchlisted item to page
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
  })



          

// listen for the Like button and add it to database as well as to website 
 document.querySelector("#like-button").addEventListener('click', async function(event) {
  event.preventDefault()

  console.log(`like button  like button clicked!`)

  // LAMBDA Add stock to the user-specific userwatchlist and add HTML accordingly 
  let response = await fetch('/.netlify/functions/create_like', {
    method: 'POST',
    body: JSON.stringify({
      likeId: "1 like"
    })
  })
  
  let numberLikes1 = numberLikes + 1

  // Add # of Likes to Page
  document.querySelector('#likes').innerHTML = `${numberLikes1} Likes`;

})   








                      
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
    })


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