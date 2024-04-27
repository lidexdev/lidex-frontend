import React, { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";

//components
import OneStop from "./../components/Home/OneStop";
//images
import Shape1 from "./../assets/images/home-banner/shape1.png";
import Shape3 from "./../assets/images/home-banner/shape3.png";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getRandomTipAccount } from "./../utils/jito";
import bs58 from "bs58";
import BN from "bn.js";
import {
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// import * as Client from '@web3-storage/w3up-client'
import {
  LIQUIDITY_STATE_LAYOUT_V4,
  Liquidity,
  MARKET_STATE_LAYOUT_V3,
  Market,
  SPL_ACCOUNT_LAYOUT,
  Token,
  TokenAmount,
  TxVersion,
  jsonInfo2PoolKeys,
} from "@raydium-io/raydium-sdk";

var abbreviate = require("number-abbreviate");
function Home() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [link, setLink] = useState("");
  const [TxResult, setTxResult] = useState("");
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [amountToSell, setAmountToSell] = useState(0);
  const [SolBalance,setSolBalance]=useState(0);
  const { connection } = useConnection();
  const tokenApi = "https://token.lidex.ai/token/";
  const lpApi = "https://token.lidex.ai/lp/token/";
  const txApi = "https://tx.lidex.ai/jito/sendtx";
  // const rpc = "https://rebeka-ye4irl-fast-mainnet.helius-rpc.com/";
  const [tokenImage, setTokenImage] = useState("");
  const [solPrice, setSolPrice] = useState(0);
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  ///
  //
  
  const [tokenObj, setToken] = useState({
    hash: "",
    name: "",
    symbol: "",
    decimals: 0,
    supply: "",
    uri: "",
    logo: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
  });
  const [tokenPoolInfo, setTokenPoolInfo] = useState({
    price: "",
    marketcap: "",
    liquidity: "",
    pooledToken: 0,
    pooledSol: 0,
    balance: 0,
    balanceValue: 0,
    ammid: "",
    poolcointokenaccount: "",
    poolpctokenaccount: "",
  });
  async function getTokenAccounts(connection, owner) {
    const tokenResp = await connection.getTokenAccountsByOwner(
      owner,
      {
        programId: TOKEN_PROGRAM_ID,
      },
      "processed"
    );

    const accounts = [];
    for (const { pubkey, account } of tokenResp.value) {
      accounts.push({
        pubkey,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
        programId: TOKEN_PROGRAM_ID,
      });
    }
    console.log("accounts");
    console.log(accounts);

    return accounts;
  }
  const UpdateSolBalance=useCallback(async()=>{
    const balance=await connection.getBalance(publicKey,"processed");
    setSolBalance(balance);
  },[publicKey,connection])
  const getTokenBalance=useCallback(async(token)=> {
    const [tokenAccount] = PublicKey.findProgramAddressSync([publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(token).toBuffer()], ASSOCIATED_TOKEN_PROGRAM_ID);
    const ba=await connection.getTokenAccountBalance(
      tokenAccount,
        "processed"
      )
    //   alert(ba.value.uiAmount)
	  return ba.value.uiAmount;
  },[connection,publicKey])
  const updateTokenBalance = useCallback(async(token,retrie=5)=>{
	try{
    UpdateSolBalance()
		const newBalance = await getTokenBalance(token);
		if (newBalance !== undefined&&newBalance!==tokenBalance) {
			setTokenBalance(newBalance);
		}else if(newBalance === undefined||newBalance!==tokenBalance){
			
		}
	}catch(e){
		console.log(e)
		setTimeout(() => {
			updateTokenBalance(token,retrie-1);
		}, 1000);
	}
    
  },[tokenBalance,getTokenBalance,UpdateSolBalance])
  const formatAmmKeysById= useCallback(async(id)=> {
    try {
      const account = await connection.getAccountInfo(new PublicKey(id));
      if (account === null) throw Error(" get id info error ");
      const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

      const marketId = info.marketId;
      const marketAccount = await connection.getAccountInfo(marketId);
      if (marketAccount === null) throw Error(" get market info error");
      const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
      return {
        id,
        baseMint: info.baseMint.toString(),
        quoteMint: info.quoteMint.toString(),
        lpMint: info.lpMint.toString(),
        baseDecimals: info.baseDecimal.toNumber(),
        quoteDecimals: info.quoteDecimal.toNumber(),
        lpDecimals: 9,
        version: 4,
        programId: account.owner.toString(),
        authority: Liquidity.getAssociatedAuthority({
          programId: account.owner,
        }).publicKey.toString(),
        openOrders: info.openOrders.toString(),
        targetOrders: info.targetOrders.toString(),
        baseVault: info.baseVault.toString(),
        quoteVault: info.quoteVault.toString(),
        withdrawQueue: info.withdrawQueue.toString(),
        lpVault: info.lpVault.toString(),
        marketVersion: 3,
        marketProgramId: info.marketProgramId.toString(),
        marketId: info.marketId.toString(),
        marketAuthority: Market.getAssociatedAuthority({
          programId: info.marketProgramId,
          marketId: info.marketId,
        }).publicKey.toString(),
        marketBaseVault: marketInfo.baseVault.toString(),
        marketQuoteVault: marketInfo.quoteVault.toString(),
        marketBids: marketInfo.bids.toString(),
        marketAsks: marketInfo.asks.toString(),
        marketEventQueue: marketInfo.eventQueue.toString(),
        lookupTableAccount: PublicKey.default.toString(),
      };
    } catch (e) {
      setTxResult("Error: " + e);
    }
  },[connection])
  const reset = () => {
    setToken({
      name: "",
      symbol: "",
      hash: "",
      decimals: "",
      supply: "",
      uri: "",
      logo: "",
      description: "",
      twitter: "",
      telegram: "",
      website: "",
    });
    setTokenPoolInfo({
      price: "",
      marketcap: "",
      liquidity: "",
      pooledToken: 0,
      pooledSol: 0,
      balance: 0,
      balanceValue: 0,
      ammid: "",
      poolcointokenaccount: "",
      poolpctokenaccount: "",
    });
    setTokenImage("");
    setLink("");
    setTxResult("");
    setTokenBalance(0);
    setAmountToBuy(0);
    setAmountToSell(0);
  };
  const fetchToken = async (token) => {
    reset();
    if (token === "" || token === undefined || token.length < 42) {
      return;
    }
    const response = await fetch(tokenApi + token);
    const data = await response.json();
    if (
      data !== undefined &&
      data.data !== undefined &&
      data.data.hash !== undefined
    ) {
      const obj = {
        hash: data.data.hash,
        name: data.data.name,
        symbol: data.data.symbol,
        decimals: data.data.decimal,
        supply: data.data.supply,
        uri: data.data.uri,
        logo: "",
        description: "",
        twitter: "",
        telegram: "",
        website: "",
      };
      setToken(obj);
      setTokenImage("");
      const metadata = await fetch(data.data.uri);
      const metadataJson = await metadata.json();
      console.log(metadataJson);
      if (metadataJson !== undefined && metadataJson.image !== undefined) {
        setTokenImage(metadataJson.image);
        obj.logo = metadataJson.image;
        obj.description = metadataJson.description;
        if (metadata.exten) console.log(obj.logo);
      }
      fetchLP(token, data.data.supply, data.data.decimal);
    } else {
      console.log("Token not found");
    }
  };
  const getSolPrice = useCallback(async () => {
    const poolSol = (
      await connection.getTokenAccountBalance(
        new PublicKey("DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz"),//pool sol address
        "processed"
      )
    ).value.uiAmount;
    const poolUSD = (
      await connection.getTokenAccountBalance(
        new PublicKey("HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz"),//pool usdc address
        "processed"
      )
    ).value.uiAmount;
    return poolUSD / poolSol;
  },[connection]);
  const fetchLP = async (token, supply, decimals) => {
    const response = await fetch(lpApi + token);
    const data = await response.json();

    if (data !== undefined && data.data !== undefined && data.data.length > 0) {
      // const obj=Object.assign({}, tokenObj)
      // 	console.log("lp---")
      console.log(data);
      // console.log(obj)
      // console.log(tokenObj)
      const obj = {};
      if (data.data[0].ammid !== undefined) {
        obj.ammid = data.data[0].ammid;
        obj.poolcointokenaccount = data.data[0].poolcointokenaccount;
        obj.poolpctokenaccount = data.data[0].poolpctokenaccount;
        //
        const poolA = await connection.getTokenAccountBalance(
          new PublicKey(obj.poolcointokenaccount),
          "processed"
        );
        const poolB = await connection.getTokenAccountBalance(
          new PublicKey(obj.poolpctokenaccount),
          "processed"
        );
        obj.pooledToken =
          data.data[0].token_a === token
            ? poolA.value.uiAmount
            : poolB.value.uiAmount;
        obj.pooledSol =
          data.data[0].token_a === token
            ? poolB.value.uiAmount
            : poolA.value.uiAmount;
        if (solPrice === 0) {
          const solPriceNew = await getSolPrice();
          setSolPrice(solPriceNew);
        // alert(solPrice)
          obj.price = (obj.pooledSol * solPriceNew) / obj.pooledToken;
          obj.marketcap = (obj.price * supply) / Math.pow(10, decimals);
          obj.liquidity = obj.pooledSol * solPriceNew * 2;
        } else {
          obj.price = (obj.pooledSol * solPrice) / obj.pooledToken;
          obj.marketcap = (obj.price * supply) / Math.pow(10, decimals);
          obj.liquidity = obj.pooledSol * solPrice * 2;
        }
        //
      }
      setTokenPoolInfo(obj);
      updateTokenBalance(token);
    } else {
      console.log("Token not found");
    }
  };
  const fetchSolPrice =useCallback(async () => {
    setSolPrice(await getSolPrice());
  },[getSolPrice]);
  
  async function getAmmId(token) {
    try {
      const data = await fetch(
        "https://token.lidex.ai/lp/token/" + token
      ).then((response) => response.json());
      if (
        data.data != null &&
        data.data.length > 0 &&
        data.data[0].ammid != null
      ) {
        return data.data[0].ammid;
      }
    } catch (e) {
      setTxResult("Error: " + e);
    }

    return "";
  }
  const Swap = useCallback(
    async (type) => {
      if (type==="buy"&&amountToBuy<=0){
        alert("Please enter amount to buy")
        return;
      }
      if (type==="buy"&&amountToBuy>SolBalance/1000000000){
        alert("Insufficient Sol Balance or not connected to wallet")
        return;
      }
      if (type==="sell"&&amountToSell<=0){
        alert("Please enter amount to sell")
        return;
      }
      if (type==="sell"&&amountToSell>tokenBalance){
        alert("Insufficient Token Balance or not connected to wallet")
        return;
      }
      const AmountIn =
        type === "buy"
          ? new TokenAmount(
              new Token(
                TOKEN_PROGRAM_ID,
                new PublicKey("So11111111111111111111111111111111111111112"),
                9
              ),
              new BN(amountToBuy * 1000000000)
            )
          : new TokenAmount(
              new Token(
                TOKEN_PROGRAM_ID,
                new PublicKey(tokenObj.hash),
                tokenObj.decimals
              ),
              new BN(amountToSell * Math.pow(10, tokenObj.decimals))
            );
      const AmountOut =
        type === "buy"
          ? new TokenAmount(
              new Token(
                TOKEN_PROGRAM_ID,
                new PublicKey(tokenObj.hash),
                tokenObj.decimals
              ),
              new BN(1)
            )
          : new TokenAmount(
              new Token(
                TOKEN_PROGRAM_ID,
                new PublicKey("So11111111111111111111111111111111111111112"),
                9
              ),
              new BN(1)
            );
      const ammid = await getAmmId(tokenObj.hash);
      console.log(ammid);
      const targetPoolInfo = await formatAmmKeysById(ammid);
      // alert(targetPoolInfo.lpMint.toString());
      // retur
      const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);
      console.log(tokenObj.hash);
      console.log(poolKeys);
      console.log(amountToBuy * 1000000000);
      console.log(amountToSell);
      console.log(AmountIn.token.mint.toString(), AmountIn.amount);
      console.log(AmountOut.token.mint.toString(), AmountOut.amount);
      console.log(publicKey.toString());
      const innerTransactions = await Liquidity.makeSwapInstructionSimple({
        connection,
        poolKeys: poolKeys,
        userKeys: {
          tokenAccounts: tokenAccounts,
          owner: publicKey,
          payer: publicKey,
        },
        amountIn: AmountIn,
        amountOut: AmountOut,
        fixedSide: "in",
        makeTxVersion: TxVersion.LEGACY,
        computeBudgetConfig: {
          units: 100000,
          microLamports: 10000000,
        },
      });
      const tx = new Transaction();
      var signers = [];
      for (const transition of innerTransactions.innerTransactions) {
        for (const instruction of transition.instructions) {
          tx.add(instruction);
        }
        for (const sign of transition.signers) {
          signers.push(sign);
        }
      }
      {
        const intrsTip = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: getRandomTipAccount(),
          lamports: 10000000,
        });
        tx.add(intrsTip);
      }
      const blockHash = (await connection.getLatestBlockhash("finalized"))
        .blockhash;
      tx.recentBlockhash = blockHash;
      tx.feePayer = publicKey;
      const rawtx = await signTransaction(tx);
      const rawtx58 = bs58.encode(rawtx.serialize());
      setLink(
        "https://solscan.io/tx/" +
          bs58.encode(rawtx.signatures[0].signature)
      );
      setTxResult("Processing...");
      fetch(txApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tx: rawtx58 }),
      })
        .then((response) => response.json())
        .then((data) => {
          getConfirmation(
            connection,
            bs58.encode(rawtx.signatures[0].signature)
          ).then((res) => {
            setTxResult(res ? "Confirmed" : "Error");

            getTokenAccounts(connection, publicKey).then((res) => {
              setTokenAccounts(res);
              
            });
			updateTokenBalance(tokenObj.hash);
          });
        });
      // const txRawData= await signTransaction(tx)
      //  sendTransactionNomal(tx, connection, signers, true)

      // setTxResult("Transaction Result: "+txresult)
    },
    [
      publicKey,
      connection,
      tokenObj,
      amountToBuy,
      amountToSell,
      formatAmmKeysById,
      signTransaction,
      tokenAccounts,
      updateTokenBalance,
      SolBalance,
      tokenBalance
    ]
  );
 
  useEffect(() => {
    UpdateSolBalance()
    fetchSolPrice();
    if (connection != null && publicKey != null) {
      getTokenAccounts(connection, publicKey).then((res) =>
        setTokenAccounts(res)
      );
    }
  }, [publicKey, connection, sendTransaction, signTransaction, UpdateSolBalance,fetchSolPrice]);
  const getConfirmation = async (connection, tx) => {
    const result = await connection.confirmTransaction(tx, "processed");
    if (result.value.err) {
      return false;
    } else {
      return true;
    }
  };
  return (
    <div>
      <div className="page-content">
        <div className="main-bnr style-1 ">
          <img className="bg-shape1  d-none" src={Shape1} alt="" />
          <img className="bg-shape2 d-none" src={Shape1} alt="" />
          <img className="bg-shape3 d-none" src={Shape3} alt="" />
          <img className="bg-shape4 d-none" src={Shape3} alt="" />
        </div>
        <section className="clearfix section-wrapper1 bg-primary-light ">
          <div className="clearfix bg-primary-light top-margin"></div>
          <div className="container">
            <div className="form-wrapper-box style-1 text-center">
              <div className="section-head ">
                <h4 className="title m-t0">Seamless token trading</h4>
                <p>
                  Trade Solana tokens with lightning-fast swaps, even during
                  congestion
                </p>
              </div>
              <form className="dz-form">
                <div className="form-wrapper">
                  <div className="flex-1">
                    <div className="row g-3">
                      <div className="col-xl-12 col-md-12 ">
                        <input
                          name="dzName"
                          type="text"
                          required=""
                          placeholder="Token Address (CA)"
                          className="form-control"
                          onChange={(e) => fetchToken(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-lg btn-gradient btn-primary btn-shadow"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
          <img className="bg-shape1" src={Shape1} alt="" />
        </section>
        {tokenObj.name !== "" ? (
          <section className="content-inner bg-light icon-section section-wrapper2">
            <div className="container">
              <div className="form-wrapper-box style-1  box-project-token ">
                {/* <div className="col-xl-12 col-lg-12"> */}
                <div className="row">
                  <div className="col-lg-9">
                    <div className="dz-card style-1 blog-half">
                      <div className="dz-media">
                        <img
                          src={
                            tokenImage === ""
                              ? "https://via.placeholder.com/200x200"
                              : tokenImage
                          }
                          alt=""
                        />
                      </div>
                      <div className="dz-info">
                        <h4 className="dz-title">
                          <Link to={"/blog-details"}>
                            {tokenObj.name} ({tokenObj.symbol})
                          </Link>
                        </h4>
                        <p className="m-b0">
                          CA: <b>{tokenObj.hash} </b>
                        </p>
                        <p className="m-b0">
                          Price: <b>${tokenPoolInfo.price} </b>
                        </p>
                        <p className="m-b0">
                          Marketcap:{" "}
                          <b>${abbreviate(tokenPoolInfo.marketcap)} </b>
                        </p>
                        <p className="m-b0">
                          Liquidity:{" "}
                          <b>
                            $
                            {tokenPoolInfo.liquidity?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </b>
                        </p>
                        <p className="m-b0">
                          Pooled {tokenObj.symbol}:{" "}
                          <b>
                            {tokenPoolInfo.pooledToken?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            {tokenObj.symbol}
                          </b>
                        </p>
                        <p className="m-b0">
                          Pooled Sol:{" "}
                          <b>
                            {tokenPoolInfo.pooledSol?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            SOL
                          </b>
                        </p>
                        <p className="m-b0">
                          Your Balance:{" "}
                          <b>
                            {" "}
                            {(tokenBalance).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {tokenObj.symbol}
                          </b>
                        </p>
                        <p className="m-b0">
                          Your Balance in USD:{" "}
                          <b>
                            {" "}
                            $
                            {(
                              tokenBalance * tokenPoolInfo.price
                            )?.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </b>
                        </p>
                        {link !== "" ? (
                          <p className="m-b0">
                            <label className="w-full block text-blue-600">
                              {link !== "" ? (
                                <a href={link} target="blank">
                                  Tx sent!! Click to go to Solscan
                                </a>
                              ) : (
                                ""
                              )}
                            </label>
                            <br />
                            <label className="w-full block">
                              Transaction Confirmation Status:{" "}
                              {TxResult === "Confirmed" ? (
                                <span className="txt-status-tx">
                                  {TxResult}
                                </span>
                              ) : (
                                TxResult
                              )}
                            </label>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 trade-token-button align-items-center justify-content-center">
                    <label className="label-sol-balance">You have <b className="txt-balance">{(SolBalance/1000000000).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 3,
                              }
                            )}  SOL</b></label>
                    <InputGroup className=" mb-0">
                      
                      <Form.Control
                        placeholder="Amount"
                        type="number"
                        aria-label="Amount"
                        className="input-buy"
                        value={amountToBuy>0?amountToBuy:null}
                        onChange={(e) => setAmountToBuy(e.target.value)}
                      />
                      <Button
                        variant="outline-secondary btn btn-lg btn-gradient btn-primary btn-shadow btn-buy"
                        onClick={() => {
                          Swap("buy");
                          setLink("");
                          setTxResult("");
                        }}
                      >
                        BUY
                      </Button>
                    </InputGroup>
                    <div className="input-group-btn">
                    <InputGroup className="btn-buy-amount-option-group">
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-buy-amount-option" onClick={()=>setAmountToBuy(SolBalance*0.25/1000000000)}>25%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-buy-amount-option" onClick={()=>setAmountToBuy(SolBalance*0.5/1000000000)}>50%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-buy-amount-option" onClick={()=>setAmountToBuy(SolBalance*0.75/1000000000)}>75%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-buy-amount-option" onClick={()=>setAmountToBuy((SolBalance-50000000)/1000000000)}>Max</Button>
                    </InputGroup>
                    </div>
                    <InputGroup className="mb-0">
                      <Form.Control
                        placeholder="Amount"
                        type="number"
                        aria-label="Amount"
                        className="input-sell"
                        value={amountToSell>0?amountToSell:null}
                        onChange={(e) => setAmountToSell(e.target.value)}
                      />
                      <Button
                        variant="outline-secondary btn btn-lg btn-gradient btn-primary btn-shadow btn-sell"
                        onClick={() => {
                          Swap("sell");
                          setLink("");
                          setTxResult("");
                        }}
                      >
                        SELL
                      </Button>
                    </InputGroup>
                    <div className="input-group-btn">
                    <InputGroup className="btn-sell-amount-option-group">
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-sell-amount-option" onClick={()=>setAmountToSell(tokenBalance*0.25)}>25%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-sell-amount-option" onClick={()=>setAmountToSell(tokenBalance*0.5)}>50%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-sell-amount-option" onClick={()=>setAmountToSell(tokenBalance*0.75)}>75%</Button>
                    <Button variant="w-25 outline-secondary btn btn-lg btn-gradient btn-sell-amount-option" onClick={()=>setAmountToSell(tokenBalance)}>Max</Button>
                    </InputGroup>
                    </div>
                  </div>
                </div>
                {/* </div> */}
              </div>
            </div>
          </section>
        ) : null}

        <section className="content-inner bg-light icon-section section-wrapper2">
          <div className="container">
            <div className="section-head text-center">
              <h2 className="title">
                Trade Solana tokens with{" "}
                <span className="text-primary"> lightning-fast </span> swaps
              </h2>
            </div>
            <div className="row sp60">
              <OneStop />
            </div>
          </div>
          <img className="bg-shape1" src={Shape1} alt="" />
        </section>
      </div>
    </div>
  );
}
export default Home;
