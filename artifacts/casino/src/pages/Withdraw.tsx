import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetWallet, useRequestWithdrawal, getGetWalletQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const withdrawalSchema = z.object({
  currency: z.enum(["ETH", "BTC", "SOL", "USDC"]),
  amount: z.string().min(1, "Amount is required"),
  toAddress: z.string().min(5, "Valid address is required"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function WithdrawPage() {
  const { data: wallet } = useGetWallet();
  const requestWithdrawal = useRequestWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      currency: "USDC",
      amount: "",
      toAddress: "",
    },
  });

  const selectedCurrency = form.watch("currency");
  const availableBalance = wallet?.balances.find(b => b.currency === selectedCurrency)?.balance || "0";

  const onSubmit = (data: WithdrawalFormValues) => {
    if (parseFloat(data.amount) > parseFloat(availableBalance)) {
      form.setError("amount", { message: "Insufficient balance" });
      return;
    }

    requestWithdrawal.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Withdrawal Requested",
          description: `Your request to withdraw ${data.amount} ${data.currency} is being processed.`,
        });
        form.reset({ ...data, amount: "" });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      },
      onError: (error: any) => {
        toast({
          title: "Withdrawal Failed",
          description: error.message || "An error occurred while processing your request.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw</h1>
          <p className="text-muted-foreground mt-1">Withdraw funds to your external wallet.</p>
        </div>

        <Card className="bg-card border-white/5">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Enter the amount and destination address.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground text-right mt-1">
                        Available: <span className="font-medium text-foreground">{parseFloat(availableBalance).toFixed(4)} {selectedCurrency}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="0.00" {...field} className="bg-input border-border pr-16" />
                        </FormControl>
                        <div className="absolute right-3 top-2.5 text-sm text-muted-foreground font-medium">
                          {selectedCurrency}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Address</FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter ${selectedCurrency} address`} {...field} className="bg-input border-border font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(138,43,226,0.3)] h-12 text-lg"
                  disabled={requestWithdrawal.isPending}
                >
                  {requestWithdrawal.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
