import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Withdrawal } from "../types";
import { useAppContext } from "../context/AppContext";
import { CreditCard } from "lucide-react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import FullScreenLoader from "../components/FullScreenLoader";

const AdminWithdrawal: React.FC = () => {
  const [adminWithdrawals, setAdminWithdrawals] = useState<Withdrawal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusLoader, setStatusLoader] = useState(false);
  
  const hasFetched = useRef(false);
  const [tonConnectUI] = useTonConnectUI();

  const {adminToken,initdata } = useAppContext();

  const truncateHash = (hash:string, length = 5) => {
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  };







  const fetchAdminWithdrawals = async (page = 1) => {
    console.log("hasFetched.current",hasFetched.current)
    if (hasFetched.current) return;
    hasFetched.current = true;
    const res = await fetch(`/api/admin/withdrawals?page=${page}`, {
     headers: {"Authorization": `Bearer ${adminToken}`}
    });
    const result = await res.json();
    setAdminWithdrawals(result.data);
    setTotalPages(result.totalPages);
    setCurrentPage(result.page);
    setTotalCount(result.total);
  };

  useEffect(() => {
    fetchAdminWithdrawals(currentPage);
  }, [ currentPage]);

  const handleAdminAction = async (userId:string,username:string,createdAt:string,address:string,amount:string,withdrawalId: string, action: 'approve' | 'reject') => {

    try{
      
      if(action==="approve"){
        const hash = await sendTon(address,Number(Number(amount).toFixed(4)));
              if(hash){
      const res = await fetch("/api/admin/withdrawals/action", {
            method: "POST",
            headers: {"Authorization": `Bearer ${adminToken}`,"Content-Type": "application/json"},
            body: JSON.stringify({ withdrawalId, action,hash })
          });
           if (res.ok) {
      hasFetched.current = false;

      const userMessage = "*💸 Withdrawal Alert* \nWithdrawal of *" +
      amount  +
      " GRAM * has been Successfully Deposited in your wallet *(" +
      truncateHash(address) +
      ")*."


        const channnelMessage = ` 💸 *Withdrawal Alert!* 
        👤 *User:* ${username}  
        💰 *Amount:* ${amount} GRAM 
        🏦 *Wallet:* \`${truncateHash(address)}\`
        🕰️ *Request Date:* ${new Date(createdAt).toLocaleDateString()}
        🕙 *Process Date: * ${new Date().toLocaleDateString()}
        `;
  
            
      //sendtelegramMssage to user
      await fetch("/api/admin/sendTelegramNotification", {
            method: "POST",
            headers: {"Authorization": `Bearer ${adminToken}`,"Content-Type": "application/json"},
            body: JSON.stringify({ id:userId,message:userMessage,platform:"chat",trHash:hash})
          });

      // sendtelegramMssage to channel
      await fetch("/api/admin/sendTelegramNotification", {
            method: "POST",
            headers: {"Authorization": `Bearer ${adminToken}`,"Content-Type": "application/json"},
            body: JSON.stringify({message:channnelMessage,trHash:hash,platform:"channel"})
          });

      
      }
    }

      }else{
        const reason = prompt("Enter reason:");
          if (reason == null || reason == "") {
          return;
          }
     await fetch("/api/admin/withdrawals/action", {
        method: "POST",
        headers: {"Authorization": `Bearer ${adminToken}`,"Content-Type": "application/json"},
        body: JSON.stringify({ withdrawalId, action,hash:"",reason:reason })
        });

      let userMessage = "Withdrawal of *" +
      amount  +
      " GRAM * has been *Rejected* by Admin. \n\n*Reason:* " + reason;

        await fetch("/api/admin/sendTelegramNotification", {
            method: "POST",
            headers: {"Authorization": `Bearer ${adminToken}`,"Content-Type": "application/json"},
            body: JSON.stringify({ id:userId,message:userMessage,platform:"chat",trHash:""})
          });

      }

    
  }catch(e){
console.log(e)
  }finally{
    hasFetched.current = false;
    fetchAdminWithdrawals(currentPage);
    setStatusLoader(false);
  
  }
    
   
  };



     async function checkTransaction(txHash: string) {
  const res = await fetch("/api/admin/getHashFromBoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // CRITICAL: Add this
      "Authorization": `Bearer ${adminToken}`,
      "x-telegram-init-data": initdata
    },
    body: JSON.stringify({ hash: txHash })
  });
  
  const response = await res.json();
  
  // Good practice: check for success before accessing .hash
  if (response.error) {
    console.error("Server error:", response.error);
    return null;
  }
  
  return response.hash;
}
      
      function isTxSuccessful(tx:any) {
          if (tx.aborted || tx.destroyed) return false;
          if (tx.compute_phase?.exit_code !== 0) return false;
          if (tx.action_phase?.success === false) return false;
          if (tx.in_msg?.bounced) return false;

          // 2️⃣ Outgoing message success
          const sentFunds = tx.out_msgs?.some(msg => msg.value > 0 && msg.bounced === false);
          if (!sentFunds) return false;

          return true; // executed and funds delivered
    }
      
        async function validateTx(txHash:string, timeoutMs = 30000, intervalMs = 5000) {
          const start = Date.now();
          while (Date.now() - start < timeoutMs) {
            const res = await fetch(`https://tonapi.io/v2/blockchain/transactions/${txHash}`);
              console.log("res",res)
            if (res.ok) {
              const data = await res.json();
      
              const result = isTxSuccessful(data);
               return { success: result, reason: "Transaction was success" };
            }
            await new Promise(r => setTimeout(r, intervalMs));
          }
          return { success: false, reason: "Timeout, transaction not found" };
        }
      

  const sendTon = async (address:string,amount:number) =>{
    let success =false
    setStatusLoader(true);
     const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300, 
      messages: [
          {
              address: address,
              amount: String(amount*10**9),
             
          }
      ]
    }
    console.log("myTransaction",myTransaction)
    const response = await tonConnectUI.sendTransaction(myTransaction);
     let trrhash;
    if(response.boc){
         trrhash = await checkTransaction(response.boc);
        const result = await validateTx(trrhash);
        success = result.success
      }

      return success===true?trrhash:false;
    }

    

    return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CreditCard className="text-blue-500" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Withdrawal Requests</h1>
        </div>
        <div className="flex gap-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Total: {totalCount}</span>
        </div>
          <TonConnectButton />
      </div>

      {statusLoader && <FullScreenLoader message={`Approve the transaction in your wallet and Dont Close/refresh the window...`} />}

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black text-gray-500 border-b border-white/5">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Amount (GRAM)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 uppercase text-xs font-bold tracking-widest">
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                adminWithdrawals?.map((w) => (
                  <tr key={w._id} className="text-xs font-bold hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black">{w.username || "Anonymous"}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{w.user_id}<span className="text-red-400">{w.comment?`(${w.comment})`:""}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-400">
                      {w.walletAddress}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {w.amount_ton.toFixed(4)} GRAM
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] uppercase ${
                        w.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                         w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            disabled={statusLoader}
                            onClick={() => handleAdminAction(w.user_id,w.username,w.created_at, w.walletAddress,w.amount_ton,w._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-colors"
                          >
                           {statusLoader?"Please Wait":"Approve"}
                          </button>
                          <button 
                            onClick={() => handleAdminAction(w.user_id,w.username,w.created_at,w.walletAddress,w.amount_ton,w._id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase transition-all ${
              currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Previous
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase transition-all ${
              currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawal;
