import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Questionnaireform from "@/components/forms/Questionnaireform";

export default async function PlanBuilderPage() {
    // Server-side session verification (middleware is first layer)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <Questionnaireform />;
}