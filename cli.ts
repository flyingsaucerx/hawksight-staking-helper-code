import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Command } from "commander";
import { Staking, IDL } from "./staking";

require("dotenv").config();
const program = new Command();
program.version("0.69.420");

const programId = new anchor.web3.PublicKey(
  "FJ7EgmF4wkggNdqnNfCHNQU4LB8UDT3sJWhVzv1zZXk2"
);

const owner = anchor.web3.Keypair.generate();

const connection = new anchor.web3.Connection(
  process.env.ANCHOR_PROVIDER_URL,
  "singleGossip"
);

const walletWrapper = new anchor.Wallet(owner);

const provider = new anchor.Provider(connection, walletWrapper, {
  preflightCommitment: "recent",
  skipPreflight: true,
});
const anchorProgram = new anchor.Program(
  IDL,
  programId,
  provider
) as Program<Staking>;

program
  .command("check_staked_nfts")
  .description("Get mint list of all the staked NFTs by a wallet")
  .option("-w, --wallet <string>", "Wallet")
  .action(async (options, command) => {
    const pdaList = await anchorProgram.account.stakingAccount.all([
      {
        memcmp: {
          offset: 41, //need to prepend 8 bytes for anchor's disc
          bytes: options.wallet,
        },
      },
    ]);

    for (const pda of pdaList) {
      console.log(pda.account.nft.toBase58());
    }
  });

program.parse(process.argv);
