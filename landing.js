

let apiKey        = 'fb05714722b977bae4b124ee34008ef0'

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
      document.querySelector('#usr').innerHTML = user.displayName;
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
    // YOUR CODE
  
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