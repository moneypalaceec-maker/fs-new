import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMe, useGetAdminStats, useListAdminUsers, useListAdminTransactions, useListAdminKyc } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2, Users, Activity, Banknote, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: stats } = useGetAdminStats();
  const { data: usersData } = useListAdminUsers({ page: 1, limit: 10 });
  const { data: kycData } = useListAdminKyc({ page: 1 });
  const { data: txData } = useListAdminTransactions({ page: 1, limit: 10 });

  if (userLoading) {
    return <AppLayout><div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div></AppLayout>;
  }

  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Wagers</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats?.totalWagers || "0").toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">House Profit</CardTitle>
              <Banknote className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats?.houseEdge || "0").toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingKyc || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-black/20 h-12 p-1">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="kyc">KYC Reviews</TabsTrigger>
            <TabsTrigger value="transactions">Global Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <Card className="bg-card border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>KYC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.items.map(u => (
                    <TableRow key={u.id} className="border-border">
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{u.kycStatus}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="kyc" className="mt-6">
            <Card className="bg-card border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycData?.items.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-4">No KYC records</TableCell></TableRow>
                  ) : kycData?.items.map(k => (
                    <TableRow key={k.id} className="border-border">
                      <TableCell>{k.id}</TableCell>
                      <TableCell className="font-medium">{k.fullName}</TableCell>
                      <TableCell>{k.country}</TableCell>
                      <TableCell><Badge variant="outline">{k.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-card border-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txData?.items.map(tx => (
                    <TableRow key={tx.id} className="border-border">
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell>{tx.userId}</TableCell>
                      <TableCell>{tx.amount} {tx.currency}</TableCell>
                      <TableCell><Badge variant="outline">{tx.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
