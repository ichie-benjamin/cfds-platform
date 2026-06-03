import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Transaction {
  id: string;
  amount: string;
  date: string;
  type: string;
  account: string;
  status: string;
  details: string | null;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: Transaction[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

const DepositHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>("/user/deposits");
        setTransactions(response.data.data.data);
        setError(null);
      } catch (err) {
        setError("Failed to load deposit history");
        console.error("Error fetching deposits:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="">
      <h2 className="mb-6 text-[0.95rem] font-extrabold text-[#eef2f7]">
        Deposit History
      </h2>

      {isLoading ? (
        <div className="text-center text-[#8b97a8]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00dfa2] mx-auto"></div>
          <p className="mt-3 text-[0.78rem]">Loading deposit history...</p>
        </div>
      ) : error ? (
        <div className="text-center text-[#f43f5e]">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-[0.78rem] text-[#8b97a8]">
          No deposit history found
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.03)]">
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    DATE
                  </TableHead>
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    AMOUNT
                  </TableHead>
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    TYPE
                  </TableHead>
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    ACCOUNT
                  </TableHead>
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    DETAILS
                  </TableHead>
                  <TableHead className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    STATUS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-b border-[rgba(255,255,255,0.04)] bg-transparent text-[0.78rem] text-[#eef2f7] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <TableCell className="text-[#8b97a8]">{tx.date}</TableCell>
                    <TableCell className="font-mono font-semibold text-[#eef2f7]">
                      {tx.amount}
                    </TableCell>
                    <TableCell className="capitalize text-[#eef2f7]">
                      {tx.type}
                    </TableCell>
                    <TableCell className="capitalize text-[#8b97a8]">
                      {tx.account}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-[#8b97a8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#eef2f7]"
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Info className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs",
                          tx.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : tx.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400",
                        )}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="space-y-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                      Date
                    </p>
                    <p className="text-[0.78rem] font-medium text-[#eef2f7]">
                      {tx.date}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      tx.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : tx.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400",
                    )}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-[rgba(255,255,255,0.04)] py-2">
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                      Amount
                    </p>
                    <p className="text-[0.82rem] font-semibold text-[#eef2f7]">
                      {tx.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                      Type
                    </p>
                    <p className="text-[0.78rem] font-medium capitalize text-[#eef2f7]">
                      {tx.type}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                    Account
                  </p>
                  <p className="text-[0.78rem] capitalize text-[#eef2f7]">
                    {tx.account}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex w-full items-center justify-center gap-2 border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#8b97a8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#eef2f7]"
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsDetailsOpen(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                  <span>View Details</span>
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedTransaction.details &&
                  (() => {
                    try {
                      const details =
                        typeof selectedTransaction.details === "string"
                          ? JSON.parse(selectedTransaction.details)
                          : selectedTransaction.details;

                      return Object.entries(details).map(([key, value]) => (
                        <div key={key} className="contents">
                          <div className="font-medium capitalize">
                            {key.replace(/_/g, " ")}:
                          </div>
                          <div className="text-muted-foreground break-all">
                            {String(value)}
                          </div>
                        </div>
                      ));
                    } catch (error) {
                      console.error("Error parsing details:", error);
                      return (
                        <div className="col-span-2 text-muted-foreground text-center">
                          Unable to display additional details
                        </div>
                      );
                    }
                  })()}
                {!selectedTransaction.details && (
                  <div className="col-span-2 text-muted-foreground text-center">
                    No additional details available
                  </div>
                )}
                <div className="font-medium">Status:</div>
                <div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs",
                      selectedTransaction.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : selectedTransaction.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400",
                    )}
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() +
                      selectedTransaction.status.slice(1)}
                  </span>
                </div>
                <div className="font-medium">Amount:</div>
                <div className="text-muted-foreground">
                  {selectedTransaction.amount}
                </div>
                <div className="font-medium">Date:</div>
                <div className="text-muted-foreground">
                  {selectedTransaction.date}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepositHistory;
