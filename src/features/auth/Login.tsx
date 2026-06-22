import {useForm} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver} from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, LayoutDashboard, Mail, Lock, User as UserIcon } from "lucide-react";
import api from '../../api/axios';
import { useAuthStore } from './authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { toast } from 'sonner';
import { useState } from 'react';

const emailSchema = z.string().trim().email({message: 'Invalid email address'}).max(255);
const passwordSchema = z.string().min(8,{message: "Password must be at least 8 charaters"}).max(72);
const nameSchema = z.string().trim().min(1,{message: "Name is required"}).max(100);

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Auth(){
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [tab,setTab] = useState<"login" | "register">("login");
    const [loggingIn, setLoggingIn] = useState(false);
    const [registering, setRegistering] = useState(false);
    const submitting = loggingIn || registering;

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '' }
    });

    const handleLogin = async (data: LoginFormValues) => {
        setLoggingIn(true);
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.data);
            toast.success('Logged in successfully');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to login');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleRegister = async (data: RegisterFormValues) => {
        setRegistering(true);
        try {
            const response = await api.post('/auth/register', data);
            login(response.data.data);
            toast.success('Account created successfully');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register');
        } finally {
            setRegistering(false);
        }
    };

    return(
        <div className="min-h-screen grid place-items-center bg-linear-to-br from-background via-background to-muted/40 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">FinDash</span>
        </Link>

        <Card className="border-border/60 shadow-xl">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {tab === "login"
                ? "Sign in to access your finance dashboard."
                : "Start tracking your money in under a minute."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <Field id="login-email" label="Email" icon={<Mail className="h-4 w-4" />} error={loginForm.formState.errors.email?.message}>
                    <Input id="login-email" type="email" placeholder="you@example.com" autoComplete="email" className="pl-9" {...loginForm.register("email")} />
                  </Field>
                  <Field id="login-password" label="Password" icon={<Lock className="h-4 w-4" />} error={loginForm.formState.errors.password?.message}>
                    <Input id="login-password" type="password" placeholder="••••••••" autoComplete="current-password" className="pl-9" {...loginForm.register("password")} />
                  </Field>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <Field id="reg-name" label="Full name" icon={<UserIcon className="h-4 w-4" />} error={registerForm.formState.errors.name?.message}>
                    <Input id="reg-name" type="text" placeholder="Ada Lovelace" autoComplete="name" className="pl-9" {...registerForm.register("name")} />
                  </Field>
                  <Field id="reg-email" label="Email" icon={<Mail className="h-4 w-4" />} error={registerForm.formState.errors.email?.message}>
                    <Input id="reg-email" type="email" placeholder="you@example.com" autoComplete="email" className="pl-9" {...registerForm.register("email")} />
                  </Field>
                  <Field id="reg-password" label="Password" icon={<Lock className="h-4 w-4" />} error={registerForm.formState.errors.password?.message}>
                    <Input id="reg-password" type="password" placeholder="At least 8 characters" autoComplete="new-password" className="pl-9" {...registerForm.register("password")} />
                  </Field>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-center text-muted-foreground mt-5">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    )
}

function Field({ id, label, icon, children, error }: { id: string; label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}