"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

export default function Home() {

  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<any[]>([]);

  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const [seats, setSeats] = useState<any[]>([]);

  const [loadingSeats, setLoadingSeats] = useState(false);
  const [passengerName, setPassengerName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  



  async function fetchFlights() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flights")
      .select("*");

    if (!error) {
      setFlights(data || []);
    }
    setLoading(false);
  }

  async function fetchSeats(flightId: number) {
    console.log("Fetching seats for flight:", flightId);
    setLoadingSeats(true);

    const { data, error } = await supabase
      .from("seats")
      .select("*")
      .eq("flight_id", flightId);

    console.log(data);

    if (error) {
      toast.error("Error fetching seats");
      console.log(error);
    } else {
      setSeats(data);
    }

    setLoadingSeats(false);
  }
  async function handleSeatBooking(seat: any) {
  if (bookingLoading) return;

  setBookingLoading(true);

  // Check passenger details
  if (
    !passengerName ||
    !email ||
    !age ||
    !gender
  ) {
    alert("Please fill all passenger details");
    setBookingLoading(false);
    return;
  }

  // Check if seat already booked
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("*")
    .eq("seat_id", seat.id);

  if (existingBooking && existingBooking.length > 0) {
    toast.error("Seat already booked");
    setBookingLoading(false);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error: bookingError } = await supabase
    .from("bookings")
    .insert([
      {
        flight_id: selectedFlight.id,
        seat_id: seat.id,
        passenger_name: passengerName,
        email: email,
        age: Number(age),
        gender: gender,
        user_id: user?.id,
      },
    ]);

  if (bookingError) {
    console.log(bookingError);
    toast.error("Booking failed");
    setBookingLoading(false);
    return;
  }

  // Update seat status
  const { error: seatError } = await supabase
    .from("seats")
    .update({
      is_available: false,
    })
    .eq("id", seat.id);

  if (seatError) {
    console.log(seatError);
    toast.error("Seat update failed");
    setBookingLoading(false);
    return;
  }

  toast.success("Seat booked");

  // Refresh seats
  if (selectedFlight) {
    fetchSeats(selectedFlight.id);
  }

  setBookingLoading(false);
}


  useEffect(() => {

  async function initialize() {

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    fetchFlights();
  }

  initialize();

}, []);

const deleteFlight = async (id: number) => {
  const { error } = await supabase
    .from("flights")
    .delete()
    .eq("id", id);

  if (error) {
    toast.error("Error deleting flight");
    console.log(error);
  } else {
    toast.success("Flight Deleted Successfully");

    fetchFlights();
  }
};

async function handleLogout() {

  await supabase.auth.signOut();

  toast.success("Logged Out");

  window.location.href = "/login";
}


  async function addFlight() {

    if (
      !airline ||
      !flightNumber ||
      !source ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      !price
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (Number(price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (source === destination) {
      toast.error("Source and Destination cannot be same");
      return;
    }

    const { error } = await supabase
      .from("flights")
      .insert([
        {
          airline,
          flight_number: flightNumber,
          source,
          destination,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          price: Number(price),
        },
      ]);
    

    if (error) {
      toast.error("Error adding flight");
      console.log(error);
    } else {
      toast.success("Flight Added Successfully");

      setAirline("");
      setFlightNumber("");
      setSource("");
      setDestination("");
      setDepartureTime("");
      setArrivalTime("");
      setPrice("");

      fetchFlights();
    }

      }

  async function editFlight(id: number) {
  const { error } = await supabase
    .from("flights")
    .update({
      airline,
      flight_number: flightNumber,
      source,
      destination,
      departure_time: departureTime,
      arrival_time: arrivalTime,
      price,
    })
    .eq("id", id);

  if (error) {
   toast.error("Error updating flight");
   console.log(error);
  } else {
    toast.success("Flight Updated Successfully");

   setAirline("");
   setFlightNumber("");
   setSource("");
   setDestination("");
   setDepartureTime("");
   setArrivalTime("");
   setPrice("");

   setEditId(null);

   fetchFlights();
  }
}

const filteredFlights = flights.filter((flight) => {
  return (
    flight.source
      .toLowerCase()
      .includes(searchSource.toLowerCase()) &&

    flight.destination
      .toLowerCase()
      .includes(searchDestination.toLowerCase())
  );
});

const sortedFlights = [...filteredFlights].sort((a, b) => {
  if (sortOrder === "lowToHigh") {
    return a.price - b.price;
  }

  if (sortOrder === "highToLow") {
    return b.price - a.price;
  }

  return 0;
});

const totalFlights = flights.length;

const cheapestFlight =
  flights.length > 0
    ? Math.min(...flights.map((flight) => flight.price))
    : 0;

const expensiveFlight =
  flights.length > 0
    ? Math.max(...flights.map((flight) => flight.price))
    : 0;
  

  return (
    <div
      className={`p-6 min-h-screen transition duration-300 ${
        darkMode
      ? "bg-gray-900 text-white"
      : "bg-gray-100 text-black"
    }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700">
          Flight Management System
        </h1>
        
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-8">

        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Total Flights
          </h2>

          <p className="text-3xl font-bold mt-2">
            {totalFlights}
          </p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold">
            Cheapest Flight
          </h2>

          <p className="text-3xl font-bold mt-2">
            ₹ {cheapestFlight}
          </p>
        </div>

      <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">
          Highest Price
        </h2>

        <p className="text-3xl font-bold mt-2">
          ₹ {expensiveFlight}
        </p>
      </div>

    </div>

      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="From"
          value={searchSource}
          onChange={(e) => setSearchSource(e.target.value)}
          className={`border p-2 rounded w-full ${
             darkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white text-black border-gray-300"
          }`}
        />
        <input
          type="text"
          placeholder="To"
          value={searchDestination}
          onChange={(e) => setSearchDestination(e.target.value)}
          className={`border p-2 rounded w-full ${
             darkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white text-black border-gray-300"
          }`}
        />
      </div>

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="border p-2 rounded mb-6"
      >
        <option value="">Sort By Price</option>
        <option value="lowToHigh">Low to High</option>
        <option value="highToLow">High to Low</option>

      </select>

      <div className={`p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
      >

        <h2 className="text-2xl font-bold mb-5">
          Add New Flight
        </h2>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Airline"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="text"
            placeholder="Flight Number"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="text"
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="text"
            placeholder="Departure Time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="text"
            placeholder="Arrival Time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
          />

        </div>



        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              if (editId) {
                editFlight(editId);
              } else {
                addFlight();
              }
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            {editId ? "Update Flight" : "Add Flight"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);

                setAirline("");
                setFlightNumber("");
                setSource("");
                setDestination("");
                setDepartureTime("");
                setArrivalTime("");
                setPrice("");
              }}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Cancel Edit
            </button>
          )}

        </div>

      </div>

      {loading && (
        <p className="text-center text-xl font-semibold">
          Loading flights...
        </p>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">
        Flight List
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {sortedFlights.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <h2 className="text-2xl font-bold text-gray-500">
              No Flights Found
            </h2>

            <p className="text-gray-400 mt-2">
              Try adding a new flight
            </p>
          </div>

        ) : (

        sortedFlights.map((flight) => (
          <div
            key={flight.id}
            onClick={() => {
              setSelectedFlight(flight);
              fetchSeats(flight.id);
            }}
             className={`rounded-xl shadow-lg p-6 hover:scale-105 transition duration-300 ${
              darkMode
                ? "bg-gray-800 text-white border border-gray-700"
                : "bg-white text-black"
                } cursor-pointer
            }`}
          >
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              {flight.airline}
            </h2>

            <div className={`space-y-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
            >
              <p>
                <span className="font-semibold">
                  Flight Number:
                </span>{" "}
                {flight.flight_number}
              </p>

              <p>
                <span className="font-semibold">
                  Source:
                </span>{" "}
                {flight.source}
              </p>

              <p>
                <span className="font-semibold">
                  Destination:
                </span>{" "}
                {flight.destination}
              </p>

              <p>
                <span className="font-semibold">
                  Departure:
                </span>{" "}
               {flight.departure_time}
              </p>

              <p>
                <span className="font-semibold">
                  Arrival:
                </span>{" "}
                {flight.arrival_time}
              </p>

              <p className="text-green-600 font-bold text-lg">
                ₹ {flight.price}
              </p>

            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setEditId(flight.id);

                  setAirline(flight.airline);
                  setFlightNumber(flight.flight_number);
                  setSource(flight.source);
                  setDestination(flight.destination);
                  setDepartureTime(flight.departure_time);
                  setArrivalTime(flight.arrival_time);
                setPrice(flight.price.toString());
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this flight?"
                );
                if (confirmDelete) {
                  deleteFlight(flight.id);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                 Delete
              </button>

            </div>

          </div>

        ))

      )}
      </div>
      {selectedFlight && (
        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-6">
            Seats for {selectedFlight.airline}
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Passenger Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
              type="text"
              placeholder="Passenger Name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
              />

              <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
              />

              <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
              />

              <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`border p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

            </div>
        </div>

          {loadingSeats ? (
            <p>Loading seats...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => {
                    if (seat.is_available) {
                      handleSeatBooking(seat);
                    }
                  }}
                  className={`p-4 rounded-lg font-bold text-white transition ${
                    seat.is_available
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 cursor-not-allowed"
                  }`}
                >
                  {seat.seat_number}
                  <br />
                  {seat.class}
                  <br />
                  ₹ {seat.extra_fee}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

