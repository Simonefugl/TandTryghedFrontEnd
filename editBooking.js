document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editForm");
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("id");
    console.log("Booking ID fra URL:", bookingId);

    if (!bookingId) {
        alert("Booking-ID mangler i URL'en");
        window.location.href = "bookingOverview.html";
        return;
    }



    // Hent eksisterende booking
    fetch(`http://localhost:8080/api/bookings/id/${bookingId}`)
        .then(res => res.json())
        .then(b => {
            document.getElementById("firstName").value = b.firstName;
            document.getElementById("lastName").value = b.lastName;
            document.getElementById("email").value = b.email;
            document.getElementById("phone").value = b.phone;
            document.getElementById("treatmentName").value = b.treatmentName;
            document.getElementById("date").value = b.date;
            document.getElementById("time").value = b.time;
        })
        .catch(err => {
            alert("Kunne ikke hente booking: " + err.message);
            window.location.href = "bookingOverview.html";
        });

    // Opdater booking
    form.addEventListener("submit", e => {
        e.preventDefault();

        const updatedBooking = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            treatmentName: form.treatmentName.value,
            date: form.date.value,
            time: form.time.value
        };

        fetch(`http://localhost:8080/api/bookings/id/${bookingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBooking)
        })
            .then(res => {
                if (!res.ok) throw new Error("Opdatering mislykkedes");
                alert("✅ Booking opdateret!");
                window.location.href = "bookingOverview.html";
            })
            .catch(err => alert("Fejl: " + err.message));
    });
});
