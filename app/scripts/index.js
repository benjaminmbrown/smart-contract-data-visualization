// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import {
  default as Web3
} from 'web3'
import {
  default as contract
} from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metaCoinArtifact from '../../build/contracts/MetaCoin.json'

import * as d3 from 'd3'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const MetaCoin = contract(metaCoinArtifact)

const chartRingYear = d3.selectAll('#chart-ring-year')
const chartRowSpenders = d3.selectAll('#chart-row-spenders')

chartRingYear.style('color', 'orange')
chartRowSpenders.style('color', 'orange')

const square = d3.selectAll('rect')
square.style('fill', 'orange')
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance()
      App.watchEvents()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    const self = this

    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(account, {
        from: account
      })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },
  watchEvents: function () {
    console.log('watching events')
    /*     var data1 = [
        {Name: 'Ben', Spent: 330, Year: 2014, 'total':1},
        {Name: 'Aziz', Spent: 1350, Year: 2012, 'total':2},
        {Name: 'Vijay', Spent: 440, Year: 2014, 'total':2},
        {Name: 'Jarrod', Spent: 555, Year: 2015, 'total':1},
    ];
    */
    // any time an event occurs in the token contract, watch and display
    let meta

    MetaCoin.deployed().then(function (instance) {
      meta = instance

      meta.allEvents({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, result) {
        if (!error) {
          console.log(result)
        }
      })
    })

    /*
    var tokenInstance;
    FixedTokenContract.deployed().then(function (instance) {

      tokenInstance = instance;
      //watch all events for this token
      tokenInstance.allEvents({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, result) {
        //build out popup
        var alertBox = document.createElement('div');
        alertBox.setAttribute('class', 'alert alert-info alert-dismissable');


        var eventTitle = document.createElement('div');
        eventTitle.innerHTML = '<strong>Event:' + result.event + '</strong>';
        alertBox.appendChild(eventTitle);

   

        //drat to token evens area
        document.getElementById('tokenEvents').appendChild(alertBox);

      })
    }).catch(function (e) {
      console.log(e);
      App.setStatus('Error in events', e);
    });
    */
  },

  sendCoin: function () {
    const self = this

    const amount = parseInt(document.getElementById('amount').value)
    const receiver = document.getElementById('receiver').value

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.sendCoin(receiver, amount, {
        from: account
      })
    }).then(function () {
      self.setStatus('Transaction complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  }
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})