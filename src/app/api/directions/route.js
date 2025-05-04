export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  const apiKey = "AIzaSyBfoxWJ9ldfSetZmHJH3a_ZNuttdORNA6g"; // Replace with your actual Google API key
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({
          error: data.error_message || "Directions not found.",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching directions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch directions." }),
      { status: 500 }
    );
  }
}
