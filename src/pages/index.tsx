import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { GatewayMenu } from "@/components/GatewayMenu";
import { SEO } from "@/components/SEO";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
    } else {
      setIsLoading(false);
    }
  }

  if (isLoading) return null;

  return (
    <>
      <SEO title="Tally Prime Clone" />
      <GatewayMenu />
    </>
  );
}