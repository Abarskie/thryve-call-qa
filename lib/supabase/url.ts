type SupabaseServerEnvironment = {
  readonly [key: string]: string | undefined;
};

export function getSupabaseServerUrl(
  env: SupabaseServerEnvironment = process.env,
): string {
  return (
    env.SUPABASE_SERVER_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder.supabase.co"
  );
}
