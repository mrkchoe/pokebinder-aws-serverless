"use client";

import { useParams } from "next/navigation";
import { BinderView } from "@/components/binder-view";

export default function BinderIdPage() {
  const params = useParams();
  const binderId = params.binderId as string;
  return <BinderView binderId={binderId} />;
}
