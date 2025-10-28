import MCQPractice from '@/components/MCQPractice';

export default function Page(props: any) {
  const documentId = Number(props?.params?.documentId);
  const studentId = props?.searchParams?.studentId as string | undefined;

  if (!documentId || Number.isNaN(documentId)) {
    return (
      <div className="p-4 text-red-600">Invalid document ID</div>
    );
  }

  return <MCQPractice documentId={documentId} studentId={studentId} />;
}

