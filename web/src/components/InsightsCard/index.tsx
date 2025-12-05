import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Props {
  title: string;
  description: string;
}

export default function InsightsCard({ title, description }: Props) {
  return (
    <Alert className="mt-4">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
