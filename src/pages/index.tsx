import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { GatewayMenu } from "@/components/GatewayMenu";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/auth/login");
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <SEO title="EBC HQ Accounting" />
      <GatewayMenu />
    </>
  );
}