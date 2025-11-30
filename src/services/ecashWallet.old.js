/**
 * Professional eCash Wallet Service
 * Uses ecash-lib and chronik-client directly (no minimal-xec-wallet)
 * 
 * Architecture:
 * - ChronikClient: Query blockchain (UTXOs, transactions, tokens)
 * - ecash-lib: Build and sign transactions
 * - BIP39: Mnemonic management
 */

import { ChronikClient } from 'chronik-client';
import * as ecc from 'ecash-lib';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import * as ecashaddr from 'ecashaddrjs';

// Chronik nodes available
const CHRONIK_URLS = [
  'https://chronik.be.cash',
  'https://chronik.pay2stay.com',
  'https://chronik.fabien.cash'
];

/**
 * eCash Wallet Class
 * Professional implementation with ecash-lib + chronik-client
 */
export class EcashWallet {
  constructor(mnemonic, hdPath = "m/44'/1899'/0'/0/0") {
    this.mnemonic = mnemonic;
    this.hdPath = hdPath;
    this.chronik = new ChronikClient(CHRONIK_URLS);
    
    // Derive keys from mnemonic
    this._initializeKeys();
  }

  /**
   * Initialize HD keys and addresses
   * @private
   */
  _initializeKeys() {
    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(this.mnemonic);
    
    // Derive HD key
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivedKey = hdKey.derive(this.hdPath);
    
    // Get private and public keys
    this.privateKey = derivedKey.privateKey;
    this.publicKey = derivedKey.publicKey;
    
    // Generate address
    this.address = this._publicKeyToAddress(this.publicKey);
    
    // eCash script for this address
    this.script = ecc.Script.p2pkh(ecc.shaRmd160(this.publicKey));
  }

  /**
   * Convert public key to eCash address
   * @private
   */
  _publicKeyToAddress(publicKey) {
    const hash160 = ecc.shaRmd160(publicKey);
    const address = ecashaddr.encode('ecash', 'P2PKH', hash160);
    return address;
  }

  /**
   * Get wallet address
   */
  getAddress() {
    return this.address;
  }

  /**
   * Get private key in WIF format
   */
  getPrivateKeyWIF() {
    // WIF encoding for eCash (mainnet = 0x80)
    const wifPrefix = 0x80;
    const extended = new Uint8Array([wifPrefix, ...this.privateKey]);
    
    // Double SHA256 for checksum
    const hash1 = ecc.sha256(extended);
    const hash2 = ecc.sha256(hash1);
    const checksum = hash2.slice(0, 4);
    
    // Combine and encode to base58
    const wifBytes = new Uint8Array([...extended, ...checksum]);
    return this._base58Encode(wifBytes);
  }

  /**
   * Base58 encoding
   * @private
   */
  _base58Encode(buffer) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz';
    let num = BigInt('0x' + Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join(''));
    let encoded = '';
    
    while (num > 0n) {
      const remainder = num % 58n;
      num = num / 58n;
      encoded = ALPHABET[Number(remainder)] + encoded;
    }
    
    // Add leading '1's for leading zeros
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      encoded = '1' + encoded;
    }
    
    return encoded;
  }

  /**
   * Get XEC balance and UTXOs
   */
  async getBalance() {
    try {
      // Get script hash from address
      const { type, hash } = ecashaddr.decode(this.address, true);
      const scriptHash = hash;
      
      // Query UTXOs from Chronik
      const scriptUtxos = await this.chronik.script(type, scriptHash).utxos();
      
      let totalSats = 0;
      let spendableSats = 0;
      const utxos = [];
      
      for (const utxo of scriptUtxos.utxos) {
        const value = parseInt(utxo.value);
        totalSats += value;
        
        // Check if UTXO has tokens (token dust)
        const hasToken = utxo.token !== undefined;
        
        if (!hasToken) {
          spendableSats += value;
        }
        
        utxos.push({
          txid: utxo.outpoint.txid,
          vout: utxo.outpoint.outIdx,
          value: value,
          satoshis: value,
          hasToken: hasToken,
          token: utxo.token
        });
      }
      
      return {
        balance: spendableSats / 100, // Convert to XEC
        totalBalance: totalSats / 100,
        balanceSats: spendableSats,
        totalBalanceSats: totalSats,
        utxos: utxos
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get token balance for a specific token ID
   */
  async getTokenBalance(tokenId) {
    try {
      const { type, hash } = ecashaddr.decode(this.address, true);
      const scriptUtxos = await this.chronik.script(type, hash).utxos();
      
      let tokenAmount = 0n;
      const tokenUtxos = [];
      
      for (const utxo of scriptUtxos.utxos) {
        if (utxo.token && utxo.token.tokenId === tokenId) {
          const amount = BigInt(utxo.token.amount);
          tokenAmount += amount;
          
          tokenUtxos.push({
            txid: utxo.outpoint.txid,
            vout: utxo.outpoint.outIdx,
            value: parseInt(utxo.value),
            tokenAmount: utxo.token.amount,
            tokenId: utxo.token.tokenId
          });
        }
      }
      
      return {
        tokenId: tokenId,
        balance: tokenAmount.toString(),
        utxos: tokenUtxos
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  /**
   * Get token info (name, symbol, decimals)
   */
  async getTokenInfo(tokenId) {
    try {
      const tokenInfo = await this.chronik.token(tokenId);
      
      return {
        tokenId: tokenId,
        tokenType: tokenInfo.tokenType,
        genesisInfo: {
          tokenTicker: tokenInfo.genesisInfo?.tokenTicker || 'UNKNOWN',
          tokenName: tokenInfo.genesisInfo?.tokenName || 'Unknown Token',
          decimals: tokenInfo.genesisInfo?.decimals || 0
        }
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return {
        tokenId: tokenId,
        genesisInfo: {
          tokenTicker: 'UNKNOWN',
          tokenName: 'Unknown Token',
          decimals: 0
        }
      };
    }
  }

  /**
   * Send XEC to an address
   */
  async sendXec(toAddress, amountXec) {
    try {
      // Validate address
      ecashaddr.decode(toAddress, true);
      
      const amountSats = Math.floor(amountXec * 100);
      const balanceData = await this.getBalance();
      
      if (balanceData.balanceSats < amountSats) {
        throw new Error(`Insufficient balance. Have ${balanceData.balance} XEC, need ${amountXec} XEC`);
      }
      
      // Build transaction
      const txBuilder = new ecc.TxBuilder();
      
      // Select UTXOs (simple: use all non-token UTXOs)
      let inputTotal = 0;
      const selectedUtxos = [];
      
      for (const utxo of balanceData.utxos) {
        if (!utxo.hasToken) {
          txBuilder.addInput({
            input: {
              prevOut: {
                txid: utxo.txid,
                outIdx: utxo.vout
              },
              signData: {
                value: utxo.satoshis,
                outputScript: this.script
              }
            },
            signatory: ecc.P2PKHSignatory(
              ecc.fromHex(Buffer.from(this.privateKey).toString('hex')),
              ecc.fromHex(Buffer.from(this.publicKey).toString('hex')),
              ecc.ALL_BIP143
            )
          });
          
          inputTotal += utxo.satoshis;
          selectedUtxos.push(utxo);
          
          // Stop when we have enough
          if (inputTotal >= amountSats + 1000) break; // 1000 sats for fee
        }
      }
      
      if (inputTotal < amountSats + 1000) {
        throw new Error('Insufficient UTXOs for transaction + fees');
      }
      
      // Add output to recipient
      const recipientScript = this._addressToScript(toAddress);
      txBuilder.addOutput({
        value: amountSats,
        script: recipientScript
      });
      
      // Add change output (if any)
      const fee = 546; // Minimum fee
      const change = inputTotal - amountSats - fee;
      
      if (change > 546) { // Dust limit
        txBuilder.addOutput({
          value: change,
          script: this.script
        });
      }
      
      // Sign and build transaction
      const tx = txBuilder.sign();
      const rawTx = tx.ser();
      
      // Broadcast transaction
      const txidResult = await this.chronik.broadcastTx(rawTx);
      
      return {
        txid: txidResult.txid,
        rawTx: Buffer.from(rawTx).toString('hex')
      };
    } catch (error) {
      console.error('Error sending XEC:', error);
      throw new Error(`Failed to send XEC: ${error.message}`);
    }
  }

  /**
   * Send eTokens to an address
   */
  async sendToken(tokenId, toAddress, amount) {
    try {
      // Validate address
      ecashaddr.decode(toAddress, true);
      
      const tokenBalance = await this.getTokenBalance(tokenId);
      const amountBigInt = BigInt(amount);
      
      if (BigInt(tokenBalance.balance) < amountBigInt) {
        throw new Error(`Insufficient token balance. Have ${tokenBalance.balance}, need ${amount}`);
      }
      
      const balanceData = await this.getBalance();
      if (balanceData.balanceSats < 2000) { // Need XEC for fees
        throw new Error('Insufficient XEC for transaction fees');
      }
      
      // Build eToken transaction
      const txBuilder = new ecc.TxBuilder();
      
      // Add token UTXOs as inputs
      let tokenInputTotal = 0n;
      for (const utxo of tokenBalance.utxos) {
        txBuilder.addInput({
          input: {
            prevOut: {
              txid: utxo.txid,
              outIdx: utxo.vout
            },
            signData: {
              value: utxo.value,
              outputScript: this.script
            }
          },
          signatory: ecc.P2PKHSignatory(
            ecc.fromHex(Buffer.from(this.privateKey).toString('hex')),
            ecc.fromHex(Buffer.from(this.publicKey).toString('hex')),
            ecc.ALL_BIP143
          )
        });
        
        tokenInputTotal += BigInt(utxo.tokenAmount);
      }
      
      // Add one XEC UTXO for fees
      for (const utxo of balanceData.utxos) {
        if (!utxo.hasToken) {
          txBuilder.addInput({
            input: {
              prevOut: {
                txid: utxo.txid,
                outIdx: utxo.vout
              },
              signData: {
                value: utxo.satoshis,
                outputScript: this.script
              }
            },
            signatory: ecc.P2PKHSignatory(
              ecc.fromHex(Buffer.from(this.privateKey).toString('hex')),
              ecc.fromHex(Buffer.from(this.publicKey).toString('hex')),
              ecc.ALL_BIP143
            )
          });
          break;
        }
      }
      
      // Output 1: Send tokens to recipient
      const recipientScript = this._addressToScript(toAddress);
      txBuilder.addOutput({
        value: 546, // Dust for token
        script: recipientScript,
        token: {
          amount: amount,
          tokenId: tokenId
        }
      });
      
      // Output 2: Change tokens back to sender (if any)
      const tokenChange = tokenInputTotal - amountBigInt;
      if (tokenChange > 0n) {
        txBuilder.addOutput({
          value: 546,
          script: this.script,
          token: {
            amount: tokenChange.toString(),
            tokenId: tokenId
          }
        });
      }
      
      // Sign and broadcast
      const tx = txBuilder.sign();
      const rawTx = tx.ser();
      const txidResult = await this.chronik.broadcastTx(rawTx);
      
      return {
        txid: txidResult.txid,
        rawTx: Buffer.from(rawTx).toString('hex')
      };
    } catch (error) {
      console.error('Error sending token:', error);
      throw new Error(`Failed to send token: ${error.message}`);
    }
  }

  /**
   * Convert address to script
   * @private
   */
  _addressToScript(address) {
    const { hash } = ecashaddr.decode(address, true);
    return ecc.Script.p2pkh(hash);
  }
}

/**
 * Generate a new mnemonic
 */
export function generateMnemonic() {
  return bip39.generateMnemonic(wordlist, 128); // 12 words
}

/**
 * Validate a mnemonic
 */
export function validateMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic, wordlist);
}

/**
 * Create wallet from mnemonic
 */
export function createWallet(mnemonic, hdPath = "m/44'/1899'/0'/0/0") {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }
  return new EcashWallet(mnemonic, hdPath);
}

export default {
  EcashWallet,
  generateMnemonic,
  validateMnemonic,
  createWallet
};
