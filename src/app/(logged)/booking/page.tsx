import { getServices } from "@/app/actions/get-services";
import { BookingClient } from "./booking-client";

export default async function BookingPage() {
  const services = await getServices();

  return <BookingClient initialServices={services || []} />;
}
