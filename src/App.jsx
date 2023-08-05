import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css'; 
import kp from './keypair.json'


import { Buffer } from 'buffer';

window.Buffer = Buffer;


// Referencia al tiempo de ejecucion de solana
const { SystemProgram, Keypair } = web3;

// Va a buscar el keyPair al json que creamos.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

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
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = await getProgram();

      console.log("baseAccount:", baseAccount.publicKey.toString());
      console.log("user:", provider.wallet.publicKey);
      console.log("systemProgram:", SystemProgram.programId.toString());
      
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
    if (inputValue.length === 0) {
      console.log("No se ha ingresado ningun link!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider()
      const program = await getProgram(); 
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF enviado correctamente al programa", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error enviando el GIF:", error)
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
        
      </div>
    </div>
  );
};

export default App;
