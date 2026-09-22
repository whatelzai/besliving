import { SignIn } from "@clerk/nextjs";
function sanitizeRedirect(redirect: string | undefined): string {
    if (!redirect || typeof redirect !== "string")
        return "/";
    const path = redirect.startsWith("/") ? redirect : `/${redirect}`;
    if (!path.startsWith("/") || path.startsWith("//"))
        return "/";
    return path;
}
export default async function AuthPage({ searchParams, }: {
    searchParams: Promise<{
        redirect?: string;
    }>;
}) {
    const params = await searchParams;
    const redirectTo = sanitizeRedirect(params?.redirect);
    const callbackUrl = redirectTo === "/"
        ? "/auth/callback"
        : `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
    return (<main className="auth-page">
      <SignIn forceRedirectUrl={callbackUrl} signUpForceRedirectUrl={callbackUrl} signUpUrl="/auth"/>
    </main>);
}
