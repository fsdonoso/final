

let apiKey        = '3565d6cc3aa977584cb36ba340188d02'

firebase.auth().onAuthStateChanged(async function(user) {
    
  
    if (user) {
      // Signed in
      console.log('signed in')
      
      // Retrieve user Information from firestore
      // DisplayName and Email
      let db = firebase.firestore()
      db.collection('users').doc(user.uid).set({
        name : user.displayName,
        email : user.email
      });
      //Show Current user on screen
      let loggedinUser = user.displayName
      
      document.querySelector('#usr').insertAdjacentHTML('beforeend', `
      <span class="font-bold text-xl">Welcome back, ${loggedinUser}!</span>
      `)

      // Show email on screen
      document.querySelector('#eml').innerHTML = user.email;

      
      //Exchanges API Call
      let respExchange  = await fetch(`http://api.marketstack.com/v1/exchanges?access_key=${apiKey}`)
      let jsonExchange  = await respExchange.json()
      let exchange      = jsonExchange.data

      //loop through exchanges array
      for (let i=0; i<exchange.length-1; i++) {
        let exc_name = exchange[i].name
        let exc_acrn = exchange[i].acronym
        let exc_micr = exchange[i].mic
        let exc_coun = exchange[i].country
        let stk_curr = exchange[i].currency.code

        //append elements to select control>>>>>>>>                                      identify currency>>>>>     acronym>>>>>>>>            mic>>>>>>>>  Name and Country (as label)       
        document.querySelector('#slExchange').insertAdjacentHTML('beforeend', `<option data-curr="${stk_curr}" data-acro="${exc_acrn}" value="${exc_micr}">${exc_name} - ${exc_coun}</option>`);
      }
      //trigger change event in order to load tickers to its corresponding select control.
      // See: selExchange.addEventListener
      document.querySelector("#slExchange").dispatchEvent(new Event("change"));



    // Sign-out button 
      document.querySelector('.sign-in-or-sign-out').innerHTML = `
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Out</button>`
      document.querySelector('.sign-in-or-sign-out').addEventListener('click', function(event) {
      console.log('sign out clicked')
      firebase.auth().signOut()
      document.location.href = 'index.html'
      })





          // In the following started working on Watch-list. Missing logic to continue: 
      // a.) User-specifc watchlist collection needs to be set-uo (as in HW7) and changes made above 
      // b.) When user is logged in it needs to show the watchlist of stocks - rn only coded for stocks to be added 
      // c.) When stock appears in Watchlist, the Stockname and price needs to be pulled in ---> might need to change order of code because that is only defined below currenlty  
      // d.) Functionality for stocks to be un-watchlisted in the watchlist
      // changes might entail to pull some of the HTML functionality into the JS file and then add it depending on users etc. 


      // Get data of user specific watch-listed Stocks - TO BE MADE USER-SPECIFIC
      let snapshotWatchlisted = await db.collection('watchlisted').get()
      console.log(`Number of stocks watchlisted: ${snapshotWatchlisted.size}`)
      let watchlistedStocks = snapshotWatchlisted.docs
      // console.log(watchlistedStocks)

      //  Add event listener to the watch-list button to 
          document.querySelector('#watchlist-button').addEventListener('click', async function(event) {
              event.preventDefault()
              console.log('watchlist button was clicked')   
              
              // 1.) add stock to user-specific watchlist collection in firestore when watchlist-button is clicked  
              // TBD - TO BE MADE USER-SPECIFIC


              // 2.) Show the added stock on the page in the watchlist - - TO BE MADE USER-SPECIFIC
              document.querySelector('#watchlist-element').insertAdjacentHTML('beforeend', `
                                <div class="md:w-full xl:w-1/3">
                                <div class="bg-white rounded-md flex flex-1 items-center p-4">

                                <div class="xl:px-3">
                                      <button id="unwatch-userId-markedId" class="bg-yellow-500 hover:bg-yellow-200 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                  </svg>
                                      </button>
                                </div>
                                    
                                <div class="w-full xl:px-3">
                                                <p id="stock-userId-markedId" class="font-semibold text-xl">STOCK NAME</p>
                                                </div>
                                                <span id="price-userId-markedId" class="text-blue-500 font-semibold text-lg">$233.78</span>
                                              </div>
                                </div>        
              `)
           })
    
  




    } else {
      // Signed out
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
  });
  
  window.addEventListener('DOMContentLoaded', function() {

    let selExchange = document.querySelector("#slExchange");
    let selTickers  = document.querySelector("#tickername");
    let btnCalc     = document.querySelector("#calc");


    //Event Listener to change Exchange/Market/Country
    selExchange.addEventListener('change', async function(event) {
      document.querySelector('#tickername').innerHTML = ''
      
      //API (Marketstack) requires "mic" value
      var optionMicr    = this.options[this.selectedIndex].value;
      
      let response = await fetch(`http://api.marketstack.com/v1/tickers?access_key=${apiKey}&exchange=${optionMicr}`)
      let json = await response.json()
      let stock = json.data
    

      //loop through stock/tickers array
      for (let i=0; i<stock.length; i++) {
        let stk_name = stock[i].name
        let stk_symb = stock[i].symbol

        //append to tickername select control.
        document.querySelector('#tickername').insertAdjacentHTML('beforeend', `<option data-tick="" value="${stk_symb}">${stk_name}</option>`)
      }
      //trigger change event in order to retrieve its corresponding data (latest price, latest price date)
      //See: selTickers.addEventListener
      document.querySelector("#tickername").dispatchEvent(new Event("change"));
    });

    selTickers.addEventListener('change', async function(event) {
      document.querySelector('#ticker').innerHTML = "";
      document.querySelector('#exchange').innerHTML = "";
      document.querySelector('#currency').innerHTML = "";

      var elt        = document.getElementById('slExchange');
      var optionCurr    = elt.options[elt.selectedIndex].getAttribute("data-curr");
      var optionExch    = elt.options[elt.selectedIndex].getAttribute("data-acro");
      var nomtick = this.options[this.selectedIndex].value;

      document.querySelector('#ticker').innerHTML = nomtick;
      document.querySelector('#exchange').innerHTML = optionExch;
      document.querySelector('#currency').innerHTML = optionCurr;

      
      //Get nomtick/acronym to call API Endpoint of the latest price/date
      let response = await fetch(`http://api.marketstack.com/v1/eod/latest?access_key=${apiKey}&symbols=${nomtick}`)
      let json = await response.json()
      let deod = json.data[0];
      var precioEOD   = Math.round((deod.close)*100) / 100;
      var fecha = new Date(deod.date);
      var fechaEOD    = getFormattedDate(fecha);

      //Write Values obtained from API in cells
      document.querySelector('#latestprice').innerHTML = "$" + precioEOD;
      document.querySelector('#latestpricedate').innerHTML = fechaEOD;
    });



    btnCalc.addEventListener('click', async function(event) {
      let inidate = document.querySelector('#dtinidate');
      let enddate = document.querySelector('#dtenddate');
      var nomtick = document.querySelector('#tickername').value;
      // console.log(inidate)
      // console.log(enddate)
      
      if(inidate.value != "" && enddate.value != ""){
        strIniDate = new Date(inidate.value.toString());
        strEndDate = new Date(enddate.value.toString());

        //retrieve historical data from ticker
        let response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${nomtick}&date_from=${inidate.value}&date_to=${enddate.value}`)
        let json = await response.json();
        let hdeod = json.data;
        
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

  function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
  
    return month + '/' + day + '/' + year;
}