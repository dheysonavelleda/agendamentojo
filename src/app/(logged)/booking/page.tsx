import { getServices } from "@/app/actions/get-services";
import { BookingClient } from "./booking-client";

export default async function BookingPage() {
  console.log("--- Server Component: Buscando serviços do banco de dados... ---");
  const services = await getServices();
  console.log("--- Server Component: Serviços encontrados: ---", services);

  return <BookingClient initialServices={services || []} />;
}
