"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            flights (
              airline,
              source,
              destination
            ),
            seats (
              seat_number,
              class
            )
       `)
          .eq("user_id", user?.id);

        if (error) {
          console.log(error);
        } else {
          setBookings(data || []);
        }
    }

    async function cancelBooking(booking: any) {
        const confirmCancel = confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) {
            return;
        }
        console.log("Cancel clicked");
        // 1. Delete booking
        const { error: deleteError } = await supabase
          .from("bookings")
          .delete()
          .eq("id", booking.id);

        if (deleteError) {
            console.log(deleteError);
            return;
        }

  // 2. Make seat available again
        const { error: seatError } = await supabase
          .from("seats")
          .update({
            is_available: true,
          })
            .eq("id", booking.seat_id);

        if (seatError) {
            console.log(seatError);
            return;
        }

  // 3. Refresh bookings
        fetchBookings();
    }

  return (
  <div className="p-6">

    <h1 className="text-3xl font-bold mb-6">
      My Bookings
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {bookings.map((booking) => (

        <div
          key={booking.id}
          className="bg-white shadow-lg rounded-xl p-6 border"
        >

          <h2 className="text-2xl font-bold text-blue-600 mb-3">
            {booking.flights.airline}
          </h2>

          <p>
            <span className="font-semibold">
              Passenger:
            </span>{" "}
            {booking.passenger_name}
          </p>

          <p>
            <span className="font-semibold">
              Email:
            </span>{" "}
            {booking.email}
          </p>

          <p>
            <span className="font-semibold">
              Route:
            </span>{" "}
            {booking.flights.source} →
            {" "}
            {booking.flights.destination}
          </p>

          <p>
            <span className="font-semibold">
              Seat:
            </span>{" "}
            {booking.seats.seat_number}
          </p>

          <p>
            <span className="font-semibold">
              Class:
            </span>{" "}
            {booking.seats.class}
          </p>

          <p>
            <span className="font-semibold">
              Gender:
            </span>{" "}
            {booking.gender}
          </p>

          <p>
            <span className="font-semibold">
              Age:
            </span>{" "}
            {booking.age}
          </p>

          <button
            onClick={() => cancelBooking(booking)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
          >
            Cancel Booking
          </button>

        </div>

      ))}

    </div>

  </div>
);
}