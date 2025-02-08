import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      <SignUp
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