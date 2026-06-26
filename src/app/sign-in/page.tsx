import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Control Plane</h1>
          <p className="text-sm text-slate-400">Panel de administración — AguaYa</p>
        </div>
        <SignIn routing="hash" />
      </div>
    </div>
  )
}
