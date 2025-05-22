document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("bookingTableBody");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    const deleteModal = document.getElementById("deleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    let bookings = [];
    let currentSort = "date";
    let bookingToDeleteId = null;
    

    // Hent bookinger fra backend
    fetch("http://localhost:8080/api/bookings/overview")
        .then(res => res.json())
        .then(data => {
            bookings = data;
            renderTable(bookings);
        });

    // Søg
    searchInput.addEventListener("input", () => {
        const search = searchInput.value.toLowerCase();
        const filtered = bookings.filter(b =>
            b.treatmentName?.toLowerCase().includes(search) ||
            b.firstName?.toLowerCase().includes(search) ||
            b.lastName?.toLowerCase().includes(search) ||
            b.employeeFirstName?.toLowerCase().includes(search)
        );
        renderTable(filtered);
    });

    // Sortering via dropdown
    sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value;
        renderTable(bookings);
    });

    // Sortering via kolonneoverskrifter
    document.querySelectorAll("th").forEach(th => {
        th.addEventListener("click", () => {
            const key = th.getAttribute("data-key");
            if (key) {
                bookings.sort((a, b) => {
                    if (a[key] < b[key]) return -1;
                    if (a[key] > b[key]) return 1;
                    return 0;
                });
                renderTable(bookings);
            }
        });
    });

    function renderTable(data) {
        tableBody.innerHTML = "";
        const sorted = [...data];
        if (currentSort === "date") {
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentSort === "name") {
            sorted.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
        }

        sorted.forEach(b => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${b.firstName} ${b.lastName}</td>
                <td>${b.treatmentName}</td>
                <td>${b.employeeFirstName || "–"}</td>
                <td>${b.date}</td>
                <td>${b.time}</td>
                <td>${b.email}</td>
                <td>${b.phone}</td>
                <td><button class="edit-btn" data-id="${b.id}">Rediger</button></td>
                <td><button class="delete-btn" data-id="${b.id}">Slet</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Event delegation for delete og edit
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            bookingToDeleteId = e.target.getAttribute("data-id");
            console.log("Klikket på slet, ID:", bookingToDeleteId);
            deleteModal.style.display = "flex";
        }

        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.getAttribute("data-id");
            window.location.href = `editBooking.html?id=${id}`;
        }
    });

    // Modal: Annuller
    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.style.display = "none";
        console.log("Klikket på annuller");
        bookingToDeleteId = null;
    });

    // Modal: Bekræft slet
    confirmDeleteBtn.addEventListener("click", () => {
        console.log("Bekræft slet");
        if (!bookingToDeleteId) {
            console.log("Sletter ikke noget");
            return;}
        console.log("Kalder api");
        fetch(`http://localhost:8080/api/bookings/${bookingToDeleteId}`, {
            method: "DELETE"
        })
            .then(res => {
                if (!res.ok) throw new Error("Sletning mislykkedes");
                bookings = bookings.filter(b => b.id != bookingToDeleteId);
                renderTable(bookings);
                deleteModal.style.display = "none";
            })
            .catch(err => alert("Fejl ved sletning: " + err.message));
    });
});
