document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openBookingBtn");
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("modalContent");

    let valgtBehandling = "";
    let valgtDato = "";
    let valgtTid = "";
    let step = 1;

    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        step = 1;
        valgtBehandling = "";
        valgtDato = "";
        valgtTid = "";
        renderBehandlingValg();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modal.style.display = "none";
        }
    });

    function renderBehandlingValg() {
        modalContent.innerHTML = `
            <h2>Vælg behandling</h2>
            <button class="selectable-option">Tandrensning</button>
            <button class="selectable-option">Regelmæssigt tjek</button>
            <button class="selectable-option">Rodbehandling</button>
            <button class="selectable-option">Røntgenundersøgelse</button>
            <button class="selectable-option">Bideskinne-tjek</button>
            <button class="selectable-option">Bøjle-tjek</button>
            <button class="selectable-option">Parodontoseundersøgelse</button>
            <button class="selectable-option">Kosmetisk vurdering</button>
            <button class="selectable-option">Fyldning af hul</button>
            
            <div class="modal-footer">
                <button id="closeModalBtn">Luk</button>
                <button id="nextStepBtn" disabled>Gå videre</button>
            </div>
        `;

        const options = document.querySelectorAll(".selectable-option");
        const nextStepBtn = document.getElementById("nextStepBtn");
        const closeModalBtn = document.getElementById("closeModalBtn");

        options.forEach(option => {
            option.addEventListener("click", () => {
                options.forEach(o => o.classList.remove("selected"));
                option.classList.add("selected");
                valgtBehandling = option.textContent;
                nextStepBtn.disabled = false;
            });
        });

        closeModalBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        nextStepBtn.addEventListener("click", () => {
            if (step === 1 && valgtBehandling) {
                step = 2;
                nextStepBtn.disabled = true;

                console.log("Valgt behandling:", valgtBehandling);

                fetch(`http://localhost:8080/api/employees/available-dates?treatmentName=${encodeURIComponent(valgtBehandling)}`)
                    .then(res => res.json())
                    .then(dates => {
                        dates.sort((a, b) => new Date(a) - new Date(b));
                        visDatoer(dates);
                    });
            }
        });
    }

    function visDatoer(dates) {
        modalContent.innerHTML = `<h2>Vælg en dato</h2>`;
        const container = document.createElement("div");
        container.id = "dateContainer";
        modalContent.appendChild(container);

        dates.forEach(date => {
            const btn = document.createElement("button");
            btn.textContent = date;
            btn.classList.add("date-option");
            btn.addEventListener("click", () => {
                valgtDato = date;
                container.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                nextStepBtn.disabled = false;
            });
            container.appendChild(btn);
        });

        const footer = document.createElement("div");
        footer.className = "modal-footer";
        footer.innerHTML = `
            <button id="closeModalBtn">Luk</button>
            <button id="nextStepBtn" disabled>Gå videre</button>
        `;
        modalContent.appendChild(footer);

        const nextStepBtn = footer.querySelector("#nextStepBtn");
        const closeModalBtn = footer.querySelector("#closeModalBtn");

        closeModalBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        nextStepBtn.addEventListener("click", () => {
            if (step === 2 && valgtDato) {
                step = 3;
                nextStepBtn.disabled = true;
                fetch(`http://localhost:8080/api/times/available?treatmentName=${valgtBehandling}&date=${valgtDato}`)
                    .then(res => res.json())
                    .then(times => {
                        visTider(times);
                    });
            }
        });
    }

    function visTider(times) {
        modalContent.innerHTML = `<h2>Vælg tidspunkt</h2>`;
        const container = document.createElement("div");
        container.id = "timeContainer";
        modalContent.appendChild(container);

        times.forEach(time => {
            const btn = document.createElement("button");
            btn.textContent = time;
            btn.classList.add("time-option");
            btn.addEventListener("click", () => {
                valgtTid = time;
                container.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                nextStepBtn.disabled = false;
            });
            container.appendChild(btn);
        });

        const footer = document.createElement("div");
        footer.className = "modal-footer";
        footer.innerHTML = `
            <button id="closeModalBtn">Luk</button>
            <button id="nextStepBtn" disabled>Gå videre</button>
        `;
        modalContent.appendChild(footer);

        const nextStepBtn = footer.querySelector("#nextStepBtn");
        const closeModalBtn = footer.querySelector("#closeModalBtn");

        closeModalBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        nextStepBtn.addEventListener("click", () => {
            if (step === 3 && valgtTid) {
                step = 4;
                visBrugerInfoFormular();
            }
        });
    }

    function visBrugerInfoFormular() {
        modalContent.innerHTML = `
            <h2>Indtast dine oplysninger</h2>
            <label>Fornavn: <input type="text" id="fornavn"></label>
            <label>Efternavn: <input type="text" id="efternavn"></label>
            <label>Email: <input type="email" id="email"></label>
            <label>Telefon: <input type="tel" id="telefon"></label>
            <div class="modal-footer">
                <button id="closeModalBtn">Luk</button>
                <button id="confirmBookingBtn">Bekræft booking</button>
            </div>
        `;

        document.getElementById("closeModalBtn").addEventListener("click", () => {
            modal.style.display = "none";
        });

        document.getElementById("confirmBookingBtn").addEventListener("click", () => {
            const booking = {
                treatmentName: valgtBehandling,
                date: valgtDato,
                time: valgtTid,
                firstName: document.getElementById("fornavn").value,
                lastName: document.getElementById("efternavn").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("telefon").value
            };
            visBookingBekræftelse(booking);
        });
    }

    function visBookingBekræftelse(booking) {
        modalContent.innerHTML = `
            <h2>Bekræft din booking</h2>
            <p><strong>Behandling:</strong> ${booking.treatmentName}</p>
            <p><strong>Dato:</strong> ${booking.date}</p>
            <p><strong>Tid:</strong> ${booking.time}</p>
            <p><strong>Navn:</strong> ${booking.firstName} ${booking.lastName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Telefon:</strong> ${booking.phone}</p>
            <div class="modal-footer">
                <button id="closeModalBtn">Luk</button>
                <button id="sendBookingBtn">Send booking</button>
            </div>
        `;

        document.getElementById("closeModalBtn").addEventListener("click", () => {
            modal.style.display = "none";
        });

        document.getElementById("sendBookingBtn").addEventListener("click", () => {
            fetch("http://localhost:8080/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking)
            })
                .then(res => {
                    if (!res.ok) throw new Error("Noget gik galt ved oprettelse af booking");
                    return res.json();
                })
                .then(() => {
                    modalContent.innerHTML = `
                        <h2>✅ Din booking er bekræftet!</h2>
                        <p>Tak, ${booking.firstName} – vi glæder os til at se dig.</p>
                        <p><strong>${booking.treatmentName}</strong> den <strong>${booking.date}</strong> kl. <strong>${booking.time}</strong>.</p>
                        <button id="closeConfirmationBtn">Luk</button>
                    `;
                    document.getElementById("closeConfirmationBtn").addEventListener("click", () => {
                        modal.style.display = "none";
                    });
                })
                .catch(error => {
                    alert("❌ Der opstod en fejl: " + error.message);
                });
        });
    }
});
