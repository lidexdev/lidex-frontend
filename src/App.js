import React from 'react';
import Route from './pages/route';	
import {ContextProvider} from './context/ContextProvider';
import "./assets/css/style.css";
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  return (
    <div className="App">
         <ContextProvider><Route /></ContextProvider>
		  
    </div>
  );
}

export default App;
