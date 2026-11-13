import { useState } from "react";
import { Navigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useAuth } from "../utils/authContext.tsx";
import useFetch from "../hooks/useFetch.ts";
import { MY_BOOKINGS_PATH } from "../utils/bookingService.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import ErrorMessage from "../components/ErrorMessage.tsx";
import MyProfile from "../components/MyProfile.tsx";
import MyBookings from "../components/MyBookings.tsx";
import type { MyBookingsResponse } from "../interface/types.ts";
import "../styles/MyPage.css";
import { routes } from "../utils/paths.ts";
 

export default function MyPage() {
  const { user, loading } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    data: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useFetch<MyBookingsResponse>(
    user ? `${MY_BOOKINGS_PATH}?v=${refreshKey}` : null,
  );

  if (loading) return <LoadingSpinner text="Laddar Mina sidor…" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/mypage" }} />;
  }

  const firstName = (user.username ?? "").trim().split(" ")[0];

  return (
    <div className="mypage">
      <Container className="py-4 py-lg-5">
        <header className="text-center mb-4 mb-lg-5">
          <h1 className="mypage-title">Mina sidor</h1>
          <p className="mypage-greeting mb-0">
            Hej{firstName ? ` ${firstName}` : ""}!
            <br />
            Här ser du dina uppgifter och dina bokningar.
          </p>
        </header>

        {notice && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setNotice(null)}
            className="mypage-notice"
            role="status"
          >
            {notice}
          </Alert>
        )}

        <Row className="g-4">
          <Col xs={12} lg={4}>
            <MyProfile user={user} />
          </Col>

          <Col xs={12} lg={8}>
            {bookingsLoading && (
              <LoadingSpinner text="Hämtar dina bokningar…" />
            )}
            {bookingsError && <ErrorMessage message={bookingsError} />}
            {bookings && (
              <MyBookings
                bookings={bookings}
                onCancelled={(message) => {
                  setNotice(message);
                  setRefreshKey((key) => key + 1);
                }}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

MyPage.route = {
  path: routes.myPage,
  order: 0,
  label: "Mina sidor",
};
