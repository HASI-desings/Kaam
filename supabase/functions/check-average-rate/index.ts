import { getServiceClient } from "../_shared/serviceClient.ts";

Deno.serve(async (req) => {
  try {
    const { categoryId } = await req.json();
    const supabase = getServiceClient();

    const { data: category } = await supabase
      .from("categories")
      .select("min_completed_jobs_for_average")
      .eq("id", categoryId)
      .single();

    const { data: avg } = await supabase
      .from("category_average_rates")
      .select("average_price_cents, completed_job_count")
      .eq("category_id", categoryId)
      .maybeSingle();

    const floorActive =
      !!avg && !!category && avg.completed_job_count >= category.min_completed_jobs_for_average;

    return new Response(
      JSON.stringify({
        floorActive,
        averagePriceCents: floorActive ? avg!.average_price_cents : null,
        completedJobCount: avg?.completed_job_count ?? 0,
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
