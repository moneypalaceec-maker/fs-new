import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Wallet from "@/pages/Wallet";
import Deposit from "@/pages/Deposit";
import Withdraw from "@/pages/Withdraw";
import Transactions from "@/pages/Transactions";
import Verify from "@/pages/Verify";
import Games from "@/pages/Games";
import Dice from "@/pages/games/Dice";
import Coinflip from "@/pages/games/Coinflip";
import Blackjack from "@/pages/games/Blackjack";
import Slots from "@/pages/games/Slots";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(271 76% 53%)",
    colorForeground: "hsl(260 100% 97%)",
    colorMutedForeground: "hsl(260 20% 70%)",
    colorDanger: "hsl(350 100% 60%)",
    colorBackground: "hsl(259 58% 8%)",
    colorInput: "hsl(260 40% 15%)",
    colorInputForeground: "hsl(260 100% 97%)",
    colorNeutral: "hsl(260 40% 15%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-2xl shadow-primary/20",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-400",
    alertText: "text-destructive-foreground",
    logoBox: "flex justify-center mb-4",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "bg-secondary hover:bg-secondary/80 border-border text-foreground transition-colors",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all",
    formFieldInput: "bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary",
    footerAction: "mt-6 text-center text-sm",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive",
    otpCodeFieldInput: "bg-input border-border text-foreground",
    formFieldRow: "mb-4",
    main: "p-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 bg-[url('https://images.unsplash.com/photo-1633512217621-c49c71b6727a?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md"></div>
      <div className="relative z-10">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 bg-[url('https://images.unsplash.com/photo-1633512217621-c49c71b6727a?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md"></div>
      <div className="relative z-10">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <Show when="signed-in" fallback={<Redirect to="/" />}>
      {children}
    </Show>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome to CryptoStake",
            subtitle: "Sign in to access the VIP lounge",
          },
        },
        signUp: {
          start: {
            title: "Join CryptoStake",
            subtitle: "Enter the high-stakes arena",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />

          <Route path="/dashboard">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </Route>
          <Route path="/wallet">
            <ProtectedRoute><Wallet /></ProtectedRoute>
          </Route>
          <Route path="/deposit">
            <ProtectedRoute><Deposit /></ProtectedRoute>
          </Route>
          <Route path="/withdraw">
            <ProtectedRoute><Withdraw /></ProtectedRoute>
          </Route>
          <Route path="/transactions">
            <ProtectedRoute><Transactions /></ProtectedRoute>
          </Route>
          <Route path="/verify">
            <ProtectedRoute><Verify /></ProtectedRoute>
          </Route>
          <Route path="/games">
            <ProtectedRoute><Games /></ProtectedRoute>
          </Route>
          <Route path="/games/dice">
            <ProtectedRoute><Dice /></ProtectedRoute>
          </Route>
          <Route path="/games/coinflip">
            <ProtectedRoute><Coinflip /></ProtectedRoute>
          </Route>
          <Route path="/games/blackjack">
            <ProtectedRoute><Blackjack /></ProtectedRoute>
          </Route>
          <Route path="/games/slots">
            <ProtectedRoute><Slots /></ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute><Profile /></ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute><Admin /></ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WouterRouter base={basePath}>
        <TooltipProvider>
          <ClerkProviderWithRoutes />
          <Toaster />
        </TooltipProvider>
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
