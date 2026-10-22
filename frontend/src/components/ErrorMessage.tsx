import Alert from "react-bootstrap/Alert";

type ErrorMessageProps = {
  message: string; // felmeddelandet från useFetch
};

/* Gemensam felruta.
   Användning: {error && <ErrorMessage message={error} />} */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Alert
      variant="danger"
      className="text-center my-4 mx-auto"
      style={{ maxWidth: 600 }}
      role="alert"
    >
      <Alert.Heading as="h2" className="h5">
        Något gick fel
      </Alert.Heading>
      <p className="mb-0">{message}</p>
    </Alert>
  );
}
