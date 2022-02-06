import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import config from "./utils/config";
import NftCollection from './utils/NFTCollection.json'
import { ethers } from "ethers";
const TWITTER_HANDLE = 'SergiuBreban';
const TWITTER_LINK = `https://twitter.com/SergiuBreban`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-sxk7f3nuz3';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [connectedContract, setConnectedContract] = useState(null);
  const { CONTRACT_ADDRESS } = config;
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NftCollection.abi, signer);
    setConnectedContract(connectedContract)

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found")
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        setIsMinting(true)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setIsMinting(false)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      setIsMinting(false)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={ connectWallet } className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    const onNFTMinted = (from, tokenId) => {
      console.log(from, tokenId.toNumber())
      alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
    }
    if (connectedContract) {
      connectedContract.on("NewNFTMinted", onNFTMinted);
    }
    return () => connectedContract && connectedContract.off("NewNFTMinted", onNFTMinted);
  }, [connectedContract])

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header" style={ { color: '#fff' } }>My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <a href={ OPENSEA_LINK } target='_blank' rel="noreferrer" className="sub-text">
            OpenSea collection
          </a>
          <br />
          { currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={ askContractToMintNft } className="cta-button connect-wallet-button">
              { isMinting ? "Minting...." : 'Mint NFT' }
            </button>
          ) }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={ twitterLogo } />
          <a
            className="footer-text"
            href={ TWITTER_LINK }
            target="_blank"
            rel="noreferrer"
          >{ ` by @${TWITTER_HANDLE}` }</a>
        </div>
      </div>
    </div>
  );
};

export default App;