import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "shadow-none",
          },
        }}
      />
    </main>
  );
} 