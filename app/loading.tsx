import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] p-4"><LoadingState label="Loading your wealth dashboard..." /></main>;
}
