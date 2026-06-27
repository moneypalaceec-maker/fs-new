import { AppLayout } from "@/components/layout/AppLayout";
import { useGetKyc, useSubmitKyc } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Clock, XCircle } from "lucide-react";

const kycSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(10, "Date of birth is required"),
  country: z.string().min(2, "Country is required"),
  idDocumentUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
});

type KycFormValues = z.infer<typeof kycSchema>;

export default function VerifyPage() {
  const { data: kyc, isLoading } = useGetKyc();
  const submitKyc = useSubmitKyc();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      country: "",
      idDocumentUrl: "",
      selfieUrl: "",
    },
  });

  const onSubmit = (data: KycFormValues) => {
    submitKyc.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "KYC Submitted", description: "Your identity verification is pending review." });
        queryClient.invalidateQueries();
      },
      onError: (error: any) => {
        toast({ title: "Submission Failed", description: error.message || "An error occurred.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AppLayout>
    );
  }

  const showForm = !kyc || kyc.status === "none" || kyc.status === "rejected";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
          <p className="text-muted-foreground mt-1">Required to unlock high limits and withdrawals.</p>
        </div>

        {!showForm ? (
          <Card className="bg-card border-white/5 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="p-8 text-center space-y-4">
              {kyc?.status === "approved" ? (
                <>
                  <div className="mx-auto h-20 w-20 rounded-full bg-success/20 flex items-center justify-center text-success mb-6">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-success">Verification Approved</h2>
                  <p className="text-muted-foreground">Your identity has been verified. All platform features are unlocked.</p>
                </>
              ) : (
                <>
                  <div className="mx-auto h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-6">
                    <Clock className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-500">Verification Pending</h2>
                  <p className="text-muted-foreground">We are reviewing your documents. This usually takes 1-2 hours.</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle>Submit Documents</CardTitle>
              {kyc?.status === "rejected" && (
                <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex gap-3 text-sm">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Previous Submission Rejected</p>
                    <p>{kyc.rejectionReason || "Please submit clearer documents."}</p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Residence</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(138,43,226,0.3)] h-12 text-lg"
                      disabled={submitKyc.isPending}
                    >
                      {submitKyc.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit for Verification"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
