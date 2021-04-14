import React from 'react'
import './global'
import { web3, kit } from './root'
import { StyleSheet, Text, Button, View } from 'react-native'
import {
  requestTxSig,
  waitForSignedTxs,
  requestAccountAddress,
  waitForAccountAuth,
  FeeCurrency
} from '@celo/dappkit'
import { toTxResult } from "@celo/connect"
import * as Linking from 'expo-linking'
import CounterContract from './contracts/Counter.json'

export default class App extends React.Component {

  // Set the defaults for the state
  state = {
    address: 'Not logged in',
    phoneNumber: 'Not logged in',
    cUSDBalance: 'Not logged in',
    CounterContract: {},
    count: ''
  }

  // This function is called when the page successfully renders
  componentDidMount = async () => {

    // Check the Celo network ID
    const networkId = await web3.eth.net.getId();

    // Get the deployed HelloWorld contract info for the appropriate network ID
    const deployedNetwork = CounterContract.networks[networkId];

    // Create a new contract instance with the HelloWorld contract info
    const instance = new web3.eth.Contract(
      CounterContract.abi,
      deployedNetwork && deployedNetwork.address
    );
    // Save the contract instance
    this.setState({ CounterContract: instance })
  }

  login = async () => {

    // A string you can pass to DAppKit, that you can use to listen to the response for that request
    const requestId = 'login'

    // A string that will be displayed to the user, indicating the DApp requesting access/signature
    const dappName = 'Counter'

    // The deeplink that the Celo Wallet will use to redirect the user back to the DApp with the appropriate payload.
    const callback = Linking.makeUrl('/my/path')

    // Ask the Celo Alfajores Wallet for user info
    requestAccountAddress({
      requestId,
      dappName,
      callback,
    })

    // Wait for the Celo Wallet response
    const dappkitResponse = await waitForAccountAuth(requestId)

    // Set the default account to the account returned from the wallet
    kit.defaultAccount = dappkitResponse.address

    // Get the stabel token contract
    const stableToken = await kit.contracts.getStableToken()

    // Get the user account balance (cUSD)
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount)

    // Convert from a big number to a string
    let cUSDBalance = cUSDBalanceBig.toString()

    // Update state
    this.setState({
      cUSDBalance,
      isLoadingBalance: false,
      address: dappkitResponse.address,
      phoneNumber: dappkitResponse.phoneNumber
    })
  }

  getCount = async () => {

    // Read the count stored in the Counter contract
    let _count = await this.state.CounterContract.methods.getCount().call()

    // Update state
    this.setState({ count: _count })
  }

  increment = async () => {
    const requestId = 'increment_count'
    const dappName = 'Counter'
    const callback = Linking.makeUrl('/my/path')

    // Create a transaction object to increment count
    const txObject = await this.state.CounterContract.methods.incrementCount()

    // Send a request to the Celo wallet to send an update transaction to the Counter contract
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.CounterContract.options.address,
          tx: txObject,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )

    // Get the response from the Celo wallet
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]

    // Get the transaction result, once it has been included in the Celo blockchain
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()

    console.log(`Counter contract increment count transaction receipt: `, result)

    // Update count on UI
    await this.getCount();
  }

  decrement = async () => {
    const requestId = 'increment_count'
    const dappName = 'Counter'
    const callback = Linking.makeUrl('/my/path')

    // Create a transaction object to decrement the count
    const txObject = await this.state.CounterContract.methods.decrementCount()

    // Send a request to the Celo wallet to send an update transaction to the Counter contract
    requestTxSig(
      kit,
      [
        {
          from: this.state.address,
          to: this.state.CounterContract.options.address,
          tx: txObject,
          feeCurrency: FeeCurrency.cUSD
        }
      ],
      { requestId, dappName, callback }
    )

    // Get the response from the Celo wallet
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]

    // Get the transaction result, once it has been included in the Celo blockchain
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()

    console.log(`Counter contract decrement count transaction receipt: `, result)

    // Update count on UI
    await this.getCount();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login first</Text>
        <Button title="login()"
          onPress={() => this.login()} />
        <Text style={styles.title}>Account Info:</Text>
        <Text>Current Account Address:</Text>
        <Text>{this.state.address}</Text>
        <Text>Phone number: +91 ***** *****</Text>
        <Text>cUSD Balance: {this.state.cUSDBalance}</Text>

        <Text style={styles.title}>Get Count</Text>
        <Button title="Get Count"
          onPress={() => this.getCount()} />
        <Text style={styles.count}>{this.state.count}</Text>
        <View style={styles.buttonContainer}>
          <Button style={styles.button} title="Increment count"
            onPress={() => this.increment()} />
          <Button style={styles.button} title="Decrement count"
            onPress={() => this.decrement()} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35d07f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginVertical: 8,
    fontSize: 20,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 40
  }
});
