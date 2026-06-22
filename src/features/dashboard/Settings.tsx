import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Shield, Eye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../auth/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/axios";

type Role = "admin" | "viewer";

const initialsOf = (name: string) =>
  name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

const Settings = () => {
  const { user, login } = useAuthStore();

  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    avatarUrl: user?.avatarUrl || "",
    currency: "INR",
    notifications: true,
    theme: "system" as "system" | "light" | "dark",
  }));

  const [role, setRole] = useState<Role>("admin");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/auth/me", {
        name: form.name,
        email: form.email,
        avatarUrl: form.avatarUrl,
      });

      // Sync the auth store with the updated user data
      if (res.data?.data) {
        login(res.data.data);
      }

      toast.success("Settings saved! Your preferences have been updated.");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save settings. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
            </Button>
            <h1 className="text-base font-bold tracking-tight">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Profile */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                {form.avatarUrl ? <AvatarImage src={form.avatarUrl} alt={form.name} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {initialsOf(form.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  placeholder="https://..."
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold">Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={form.theme} onValueChange={(v) => setForm((f) => ({ ...f, theme: v as "system" | "light" | "dark" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label className="text-sm">Email notifications</Label>
                <p className="text-xs text-muted-foreground">Get alerts on large or unusual transactions.</p>
              </div>
              <Switch
                checked={form.notifications}
                onCheckedChange={(c) => setForm((f) => ({ ...f, notifications: c }))}
              />
            </div>
          </section>

          {/* Access */}
          <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Access role</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Admins can add, edit, and delete transactions. Viewers have read-only access.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["admin", "viewer"] as Role[]).map((r) => {
                const Icon = r === "admin" ? Shield : Eye;
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className="text-sm font-medium capitalize">{r}</div>
                      <div className="text-xs text-muted-foreground">
                        {r === "admin" ? "Full control" : "Read-only"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;