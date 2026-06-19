import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { canGenerateWorkoutPlan } from "@/utils/Workoutratelimit/workoutRateLimit";
import Questionnaireform from "@/components/forms/Questionnaireform";

export default async function PlanBuilderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const rateLimitResult = await canGenerateWorkoutPlan(user.id);

    if (!rateLimitResult.canGenerate) {
        redirect("/?rate_limited=1");
    }

    return <Questionnaireform />;
}