"use client";

import { useProgram } from "@/hooks/useProgram";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

export const ProgramDebugger = () => {
  const { program, provider } = useProgram();
  const { connected, publicKey, signTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold mb-4">Program Debug Info</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Wallet Status:</strong>
          <ul className="ml-4">
            <li>Connected: {connected ? "✅" : "❌"}</li>
            <li>
              PublicKey: {publicKey ? "✅" : "❌"} {publicKey?.toString()}
            </li>
            <li>SignTransaction: {signTransaction ? "✅" : "❌"}</li>
            <li>SignAllTransactions: {signAllTransactions ? "✅" : "❌"}</li>
          </ul>
        </div>

        <div>
          <strong>Connection Status:</strong>
          <ul className="ml-4">
            <li>Connection: {connection ? "✅" : "❌"}</li>
            <li>Endpoint: {connection?.rpcEndpoint}</li>
          </ul>
        </div>

        <div>
          <strong>Provider Status:</strong>
          <ul className="ml-4">
            <li>Provider: {provider ? "✅" : "❌"}</li>
            <li>Provider Wallet: {provider?.wallet.publicKey?.toString()}</li>
          </ul>
        </div>

        <div>
          <strong>Program Status:</strong>
          <ul className="ml-4">
            <li>Program: {program ? "✅" : "❌"}</li>
            <li>Program ID: {program?.programId.toString()}</li>
            <li>
              Methods:{" "}
              {program?.methods
                ? Object.keys(program.methods).join(", ")
                : "None"}
            </li>
            <li>
              Accounts:{" "}
              {program?.account
                ? Object.keys(program.account).join(", ")
                : "None"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
