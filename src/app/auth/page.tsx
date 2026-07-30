"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogin, useRegister } from "@/query/auth";
import { useUserStore } from "@/store/store";

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState("");
    const [address, setAddress] = useState("");
    
    const { mutateAsync: loginMut, isPending: isLoggingIn } = useLogin();
    const { mutateAsync: registerMut, isPending: isRegistering } = useRegister();
    const loading = isLoggingIn || isRegistering;
    const { isLoggedIn } = useUserStore();

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/");
        }
    }, [isLoggedIn, router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (mode === "signup") {
                await registerMut({ full_name: fullName, email, password, phone, region, address });
                toast.success("Account created — you're signed in!");
            } else {
                await loginMut({ email, password });
                toast.success("Welcome back!");
            }
            router.push("/");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        }
    }

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            <div className="rounded-3xl bg-muted p-8">
                <h1 className="text-2xl font-bold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {mode === "signin" ? "Welcome back to Pomegrid." : "Join Pomegrid Food Trade to place wholesale orders."}
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-3">
                    {mode === "signup" && (
                        <>
                            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" required />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" required />
                            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" required />
                            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" required />
                        </>
                    )}
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" />
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-2xl bg-background px-4 py-3 text-sm" />
                    <button disabled={loading} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                        {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                    </button>
                </form>

                <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary">
                    {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
                </button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/">← Back to home</Link>
            </div>
        </div>
    );
}
