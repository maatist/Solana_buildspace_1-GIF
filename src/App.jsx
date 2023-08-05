import idl from './idl.json';
import { Connection, NonceAccount, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css'; 


import * as buffer from "buffer";

window.Buffer = buffer.Buffer;


// Referencia al tiempo de ejecucion de solana
const { SystemProgram, Keypair } = web3;

// Crea un keypar para la cuenta que va a holdear la data del GIF
let baseAccount = Keypair.generate();

// Vamos a buscar el id del programa desde el archivo idl
const programID = new PublicKey(idl.metadata.address);

// Seteamos la conexion a devnet
const network = clusterApiUrl('devnet');

// Controla como queremos reconocer cuando una transaccion esta "completa"
const opts = {
  preflightCommitment: "processed"
}

// Constantes
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const TEST_GIFS = [
	'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWx3aHV1NTJndWxmZHE4cHVsNmlwaGtzbTNhcWYwemlkcHRxNnU2NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gk3R16JhLP8RUka2nD/giphy.gif',
	'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExczVqYzIzbWt2MHdmNnE5a3U3dWo5amNndmFnaWtsMWg3amNyMnE0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S8kcDWOvua4l6lJ0Az/giphy.gif',
	'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGd4cjd6b3pwbjM1Z3Jydml4MnBzaGxvY2NlMDN3MDNrZW1idWQ4eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xTiTnKH3dDw1ww53R6/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWQ5bjV3bmZzODY0a3J0ODR0cG8zZTA4am5kMjZiZDIxaWZmZ3RhZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26hitFkJUgm7dWAwg/giphy.gif',
  'https://media1.giphy.com/media/Ab0536HZcHEJmG5XPY/giphy.gif'
]

const App = () => {

  // Estados
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

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
   * Hacer el llamado para conectar wallet
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Conectado con la llave publica:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProgram = async () => {
    // Create a program that you can call
    return new Program(idl, programID, getProvider());
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();
      
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const createGifAccountError = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Creada nueva BaseAccount con direccion:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creadno el BaseAccount:", error)
    }
  }
  

  const getGifListError = async() => {
    try {
      const program = await getProgram(); 
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setGifList(account.gifList)
  
    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }
  }

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Se obtuvo la cuenta", account)
      setGifList(account.gifList)
  
    } catch (error) {
      console.log("Error en getGifList: ", error)
      setGifList(null);
    }
  }

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    } else {
      console.log('Input vacio, intenta nuevamente');
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
   * Mapeo de los GIFs
   */

  const renderConnectedContainer = () => {
    // Por aca si la cuenta del programa aun no se inicializa
      if (gifList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-gif-button" onClick={createGifAccount}>
              Realiza la inicializacion de tu cuenta. Solo es una vez!
            </button>
          </div>
        )
      } 
      // Sino la cuenta existe y el usuario puede enviar GIFs
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input
                type="text"
                placeholder="Ingresa el link de un GIF!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {/* Usamos el index como el key, ahora el source es item.gifLink */}
              {gifList.map((item, index) => (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} />
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

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

  useEffect(() => {
    if(walletAddress){
      console.log('Fetching lista de GIFs');

      // llamada a sol app

      getGifList()

      // Set state
      //setGifList(TEST_GIFS);
    }

  }, [walletAddress])
  


  
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 Rick And Morty GIFs</p>
          <p className="sub-text">
            Coleccion de GIFs de Rick And Morty. Sube el tuyo!✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
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
