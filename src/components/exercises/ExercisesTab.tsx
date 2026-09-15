import { ExercisesView } from './ExercisesView';

interface ExercisesTabProps {
  courseId: string;
}

export function ExercisesTab({ courseId }: ExercisesTabProps) {
  return <ExercisesView courseId={courseId} />;
}