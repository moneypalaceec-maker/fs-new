import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const depositAddresses: Record<string, { address: string, network: string, color: string }> = {
  BTC: { address: "bc1qjzlpuqxh6lvwxux65uqpzue5nh2yllym5xprey", network: "Bitcoin", color: "#F7931A" },
  ETH: { address: "0x7fA636B8E805D3EA4765c2fe79C4D43cA08D5d8b", network: "Ethereum (ERC20)", color: "#627EEA" },
  SOL: { address: "AK1W2vSHMsZhLLnztqskAHzNhu3EHKoxYkuTui2yr9fX", network: "Solana", color: "#14F195" },
  USDC: { address: "AK1W2vSHMsZhLLnztqskAHzNhu3EHKoxYkuTui2yr9fX", network: "Solana (SPL)", color: "#2775CA" }
};

export default function DepositPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (address: string, currency: string) => {
    navigator.clipboard.writeText(address);
    setCopied(currency);
    toast({
      title: "Address Copied",
      description: `Deposit address for ${currency} copied to clipboard.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deposit</h1>
          <p className="text-muted-foreground mt-1">Add funds to your CryptoStake account.</p>
        </div>

        <Tabs defaultValue="BTC" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 h-14 rounded-xl p-1 mb-8">
            {Object.keys(depositAddresses).map(currency => (
              <TabsTrigger 
                key={currency} 
                value={currency}
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                {currency}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(depositAddresses).map(([currency, data]) => (
            <TabsContent key={currency} value={currency}>
              <Card className="bg-card border-white/5">
                <CardHeader>
                  <CardTitle>Deposit {currency}</CardTitle>
                  <CardDescription>
                    Send only {currency} to this address via the {data.network} network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-black/20 rounded-xl border border-white/5">
                    <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      <QRCodeSVG 
                        value={data.address} 
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="Q"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Your {currency} Deposit Address</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm break-all">
                            {data.address}
                          </div>
                          <Button 
                            variant="secondary" 
                            className="h-auto py-3 px-4"
                            onClick={() => handleCopy(data.address, currency)}
                          >
                            {copied === currency ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-primary/10 border border-primary/20 text-primary-foreground p-4 rounded-lg flex gap-3 text-sm">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-primary mb-1">Important</p>
                          <p className="text-muted-foreground">Deposits are credited automatically after 1 network confirmation. Sending any other asset to this address may result in permanent loss.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
