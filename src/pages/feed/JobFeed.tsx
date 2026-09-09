import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Job, Category } from "../../types";
import JobCard from "../../components/job/JobCard";

export default function JobFeed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    let query = supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false });
    if (selected) query = query.eq("category_id", selected);
    query.then(({ data }) => setJobs((data as Job[]) ?? []));
  }, [selected]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Job feed</h1>
        <Link
          to="/jobs/new"
          className="rounded-xl bg-teal text-white px-4 py-2 text-sm font-medium active:scale-[0.97] transition"
        >
          Post a job
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setSelected(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selected ? "bg-teal text-white" : "border border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selected === c.id ? "bg-teal text-white" : "border border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} categoryName={categoryName(job.category_id)} />
        ))}
        {jobs.length === 0 && (
          <p className="col-span-full text-center text-sm text-text-light-secondary dark:text-text-dark-secondary py-12">
            No jobs yet in this category — be the first to post.
          </p>
        )}
      </div>
    </div>
  );
}
