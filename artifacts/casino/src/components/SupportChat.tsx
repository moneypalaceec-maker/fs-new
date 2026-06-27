import { useState } from "react";
import { MessageCircle, X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSubmitted(false), 400);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-2xl",
          open && "rotate-90"
        )}
        aria-label="Support chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[340px] rounded-2xl bg-background border border-border shadow-2xl overflow-hidden transition-all duration-300",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">EnvyCasino Support</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                <span className="text-white/70 text-xs">Currently offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {submitted ? (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-foreground">Message received!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team will get back to you at <span className="font-medium text-foreground">{form.email}</span> within 24 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 rounded-full"
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-xl p-3 mb-4 text-xs text-muted-foreground border border-border leading-relaxed">
                <span className="font-semibold text-foreground">We're offline right now.</span> Leave a message below and we'll reply to your email as soon as we're back — usually within a few hours.
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name</label>
                  <Input
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
                  <Textarea
                    placeholder="Describe your issue or question..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="text-sm resize-none h-24"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-9 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Send Message
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="px-5 pb-4 text-center text-xs text-muted-foreground">
          Typical reply time: 2–6 hours
        </div>
      </div>
    </>
  );
}
