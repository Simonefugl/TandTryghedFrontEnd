document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openBookingBtn");
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("modalContent");
    const closeBtn = document.getElementById("closeModalBtn");
    const options = document.querySelectorAll(".selectable-option");

    let allBookings = [];

    // 🔁 Hent bookinger ved page load
    fetch("http://localhost:8080/api/bookings")
        .then(response => {
            if (!response.ok) {
                throw new Error("Netværksfejl: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            allBookings = data;
            console.log("Bookinger hentet:", allBookings);
        })
        .catch(error => {
            console.error("Fejl ved hentning af bookinger:", error);
        });

    // 🟢 Åbn modal ved klik
    openBtn.addEventListener("click", () => {
        modal.style.display = "block";
        modalContent.style.display = "block";
    });

    // 🔴 Luk modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        modalContent.style.display = "none";
    });

    // ✅ Markér valgte behandling
    options.forEach(option => {
        option.addEventListener("click", () => {
            options.forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");
            console.log("Valgt behandling:", option.textContent);
        });
    });
});
