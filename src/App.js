import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Card, CardContent, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3 from 'web3';
import './App.css';

const APP_NAME = 'Votex';
const APP_LOGO_URL = 'https://example.com/logo.png'; // Replace with your logo URL
const DEFAULT_ETH_JSONRPC_URL = 'https://base.llamarpc.com'; // Replace with your Infura Project ID
const DEFAULT_CHAIN_ID = 8453;

const coinbaseWallet = new CoinbaseWalletSDK({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
  darkMode: false,
});

const ethereum = coinbaseWallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);
const web3 = new Web3(ethereum);

const Root = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
}));

const CardStyled = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
  margin: 'auto',
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function App() {
  const [account, setAccount] = useState(null);
  const [vote, setVote] = useState(null);
  const [votes, setVotes] = useState({ trump: 0, biden: 0 });

  useEffect(() => {
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const handleVote = async (candidate) => {
    if (!account) return;
    try {
      const transactionParameters = {
        to: account, // Optional: You can set this to a specific address if needed
        from: account,
        value: '0x0', // $0 transaction
        data: web3.utils.toHex(`Vote for ${candidate}`), // Data payload with the vote information
      };

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      if (candidate === 'trump') {
        setVotes((prevVotes) => ({ ...prevVotes, trump: prevVotes.trump + 1 }));
      } else {
        setVotes((prevVotes) => ({ ...prevVotes, biden: prevVotes.biden + 1 }));
      }
      setVote(candidate);
    } catch (error) {
      console.error("Transaction failed", error);
    }
  };

  return (
    <Root>
      <AppBarStyled position="static">
        <Toolbar>
          <Typography variant="h6">
            Votex
          </Typography>
          {account ? (
            <>
              <Typography variant="body1" style={{ marginLeft: 'auto', marginRight: '20px' }}>
                {`Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </Typography>
              <Button color="inherit" onClick={disconnectWallet}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={connectWallet} style={{ marginLeft: 'auto' }}>
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBarStyled>
      <Container>
        <Typography variant="h4" gutterBottom>
          Presidential Election 2024
        </Typography>
        <Typography variant="h6" gutterBottom>
          Cast your vote for the next President of the United States.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <CardStyled className="VoteCard">
              <CardContent>
                <AvatarStyled src={`${process.env.PUBLIC_URL}/trump.jpg`} />
                <Typography variant="h5" component="div">
                  Donald Trump
                </Typography>
                <Typography variant="body1">
                  {votes.trump} Votes
                </Typography>
                <ButtonStyled
                  variant="contained"
                  color={vote === 'trump' ? 'success' : 'primary'}
                  onClick={() => handleVote('trump')}
                  disabled={!account}
                >
                  Vote Trump
                </ButtonStyled>
              </CardContent>
            </CardStyled>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStyled className="VoteCard">
              <CardContent>
                <AvatarStyled src={`${process.env.PUBLIC_URL}/biden.jpg`} />
                <Typography variant="h5" component="div">
                  Joe Biden
                </Typography>
                <Typography variant="body1">
                  {votes.biden} Votes
                </Typography>
                <ButtonStyled
                  variant="contained"
                  color={vote === 'biden' ? 'success' : 'primary'}
                  onClick={() => handleVote('biden')}
                  disabled={!account}
                >
                  Vote Biden
                </ButtonStyled>
              </CardContent>
            </CardStyled>
          </Grid>
        </Grid>
      </Container>
    </Root>
  );
}

export default App;
