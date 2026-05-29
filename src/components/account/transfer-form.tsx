import * as React from "react";
import { Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAccount } from "@/store/userStore";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useUserStore from "@/store/userStore";

interface TransferFormProps {
  accounts: UserAccount[];
}

export function TransferForm({ accounts }: TransferFormProps) {
  const [fromAccount, setFromAccount] = React.useState<string>("credit_wallet");
  const [toAccount, setToAccount] = React.useState<string>("balance_wallet");
  const [amount, setAmount] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const refreshUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/user");
      if (data?.data) {
        const currentToken = useUserStore.getState().token || "";
        setUser(data.data, currentToken);
      }
    } catch {
      console.error("Failed to refresh user data");
    }
  };

  const handleTransfer = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("from_account", fromAccount);
      formData.append("to_account", toAccount);
      formData.append("amount", amount);

      await axiosInstance.post("/account/convert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Transfer completed successfully");
      setAmount("");

      setTimeout(() => {
        refreshUserData();
      }, 300);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Transfer failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fromAccounts = accounts.filter((acc) => acc.transfer_type === "from");
  const toAccounts = accounts.filter((acc) => acc.transfer_type === "to");

  const inputClass =
    "w-full rounded-[10px] border border-white/[0.08] px-4 py-3 text-[0.84rem] text-[#eef2f7] outline-none transition-[border-color,box-shadow] placeholder:text-[#4a5468] focus:border-[#00dfa2] focus:ring-[3px] focus:ring-[rgba(0,223,162,0.08)]";
  const labelClass =
    "mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[#4a5468]";

  const disabled =
    !amount ||
    fromAccount === toAccount ||
    Number.parseFloat(amount) <= 0 ||
    isLoading;

  return (
    <>
      {/* .transfer-row: 1fr 1fr */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fromAccount" className={labelClass}>
            From account
          </label>
          <Select
            value={fromAccount}
            onValueChange={setFromAccount}
            disabled={fromAccounts.length === 0}
          >
            <SelectTrigger
              className={inputClass}
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <SelectValue>
                {fromAccounts.find(
                  (acc) => acc.type === fromAccount.split("_")[0]
                )?.title || "Select account"}{" "}
                {fromAccounts.find(
                  (acc) => acc.type === fromAccount.split("_")[0]
                )
                  ? ` ($${
                      fromAccounts.find(
                        (acc) => acc.type === fromAccount.split("_")[0]
                      )?.balance
                    })`
                  : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {fromAccounts.map((account) => (
                <SelectItem
                  key={account.type}
                  value={`${account.type}_wallet`}
                >
                  {account.title} &nbsp;&nbsp;&nbsp;&nbsp;(${account.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="toAccount" className={labelClass}>
            To account
          </label>
          <Select
            value={toAccount}
            onValueChange={setToAccount}
            disabled={toAccounts.length === 0}
          >
            <SelectTrigger
              className={inputClass}
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <SelectValue>
                {toAccounts.find((acc) => acc.type === toAccount.split("_")[0])
                  ?.title || "Select account"}{" "}
                {toAccounts.find((acc) => acc.type === toAccount.split("_")[0])
                  ? ` ($${
                      toAccounts.find(
                        (acc) => acc.type === toAccount.split("_")[0]
                      )?.balance
                    })`
                  : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {toAccounts.map((account) => (
                <SelectItem
                  key={account.type}
                  value={`${account.type}_wallet`}
                >
                  {account.title} &nbsp;&nbsp;&nbsp;&nbsp;(${account.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* .amount-input-wrap */}
      <div className="mb-5">
        <label htmlFor="amount" className={labelClass}>
          Amount (USD)
        </label>
        <input
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          style={{ background: "rgba(255,255,255,0.04)" }}
          placeholder="Enter amount to transfer"
          type="number"
          step="0.01"
          min="0"
        />
      </div>

      {/* .transfer-btn */}
      <button
        type="button"
        onClick={handleTransfer}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-0 py-3.5 text-[0.88rem] font-extrabold tracking-[0.02em] text-[#07080c] shadow-[0_4px_16px_rgba(0,223,162,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,223,162,0.3)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        style={{
          background: "linear-gradient(135deg, #00dfa2, #00b881)",
        }}
      >
        <Send className="h-3.5 w-3.5" />
        {isLoading ? "Processing..." : "Make Transfer"}
      </button>
    </>
  );
}
