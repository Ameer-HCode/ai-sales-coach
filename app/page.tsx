import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default async function Home() {
    const { userId } = await auth();

    if (userId) {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black text-white">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    AI Sales Coach
                </h1>
                <p className="text-gray-400">Sign in to access your real-time coaching dashboard.</p>
                <SignInButton mode="modal">
                    <button className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all">
                        Get Started
                    </button>
                </SignInButton>
            </div>
        </div>
    );
}
