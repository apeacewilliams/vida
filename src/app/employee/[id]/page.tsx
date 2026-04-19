import { EmployeeSuggestions } from "./EmployeeSuggestions";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeSuggestions employeeId={id} />;
}
