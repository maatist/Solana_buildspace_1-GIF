import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  // State
  const [walletAddress, setWalletAddress] = useState(null);

  /*
   * Revisar si esta conectada la wallet
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet encontradaa!');

          /*
         * Directamente conectamos a la wallet del usuario
         */
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Conectado a la llave publica:',
          response.publicKey.toString()
        );
          /*
           * Despues del log se setea la llave publica del usuario
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Objeto de solana no encontrado! Obten una billetera 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Esto para que no se rompa por ahora
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Conectado con la llave publica:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  /*
   * Solo renderizar el boton si el usuario aun no esta conectado a nuesta app
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Conecta tu billetera
    </button>
  );

  /*
   * Al levantar el componente verifica si esta conectada la wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse Prueba 1.0✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
