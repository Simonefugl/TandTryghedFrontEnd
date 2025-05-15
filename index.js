document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openBookingBtn");
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("modalContent");
    const closeBtn = document.getElementById("closeModalBtn");
    const nextStepBtn = document.getElementById("nextStepBtn");
    const options = document.querySelectorAll(".selectable-option");

    let valgtBehandling = "";
    let valgtDato = "";
    let valgtTid = "";
    let step = 1;

    // Åbn modal
    openBtn.addEventListener("click", () => {
        modal.style.display = "block";
        modalContent.style.display = "block";
        clearModalBelowTreatment();
        step = 1;
    });

    // Luk modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        modalContent.style.display = "none";
    });

    // Vælg behandling
    options.forEach(option => {
        option.addEventListener("click", () => {
            options.forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");
            valgtBehandling = option.textContent;
            console.log("Valgt behandling:", valgtBehandling);
            nextStepBtn.disabled = false;
        });
    });

    // Håndter step-flow med "Gå videre"-knap
    nextStepBtn.addEventListener("click", () => {
        if (step === 1 && valgtBehandling) {
            clearModalBelowTreatment();
            fetch(`http://localhost:8080/api/employees/available-dates?treatmentName=${valgtBehandling}`)
                .then(res => res.json())
                .then(dates => {
                    dates.sort((a, b) => new Date(a) - new Date(b));
                    visDatoer(dates);
                });
            step = 2;
            nextStepBtn.disabled = true;
        } else if (step === 2 && valgtDato) {
            clearModalBelowTreatment(false); // behold dateContainer
            fetch(`http://localhost:8080/api/times/available?treatmentName=${valgtBehandling}&date=${valgtDato}`)
                .then(res => res.json())
                .then(times => {
                    visTider(valgtBehandling, valgtDato, times);
                });
            step = 3;
            nextStepBtn.disabled = true;
        } else if (step === 3 && valgtTid) {
            clearModalBelowTreatment(false); // behold tidligere valg
            visBrugerInfoFormular();
            nextStepBtn.style.display = "none";
            step = 4;
        }
    });

    // Vis datoer
    function visDatoer(dates) {
        const container = document.createElement("div");
        container.id = "dateContainer";
        modalContent.appendChild(container);

        const title = document.createElement("h3");
        title.textContent = "Vælg en dato:";
        container.appendChild(title);

        dates.forEach(date => {
            const btn = document.createElement("button");
            btn.textContent = date;
            btn.classList.add("date-option");
            btn.addEventListener("click", () => {
                valgtDato = date;
                console.log("Valgt dato:", valgtDato);
                container.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                nextStepBtn.disabled = false;
            });
            container.appendChild(btn);
        });
    }

    // Vis tider
    function visTider(behandling, dato, times) {
        const container = document.createElement("div");
        container.id = "timeContainer";
        modalContent.appendChild(container);

        const title = document.createElement("h3");
        title.textContent = "Vælg tidspunkt:";
        container.appendChild(title);

        times.forEach(time => {
            const btn = document.createElement("button");
            btn.textContent = time;
            btn.classList.add("time-option");
            btn.addEventListener("click", () => {
                valgtTid = time;
                console.log("Valgt tid:", valgtTid);
                container.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                nextStepBtn.disabled = false;
            });
            container.appendChild(btn);
        });
    }

    // Vis inputformular
    function visBrugerInfoFormular() {
        const form = document.createElement("div");
        form.id = "brugerInfo";

        form.innerHTML = `
            <h3>Indtast dine oplysninger</h3>
            <label>Fornavn: <input type="text" id="fornavn"></label><br>
            <label>Efternavn: <input type="text" id="efternavn"></label><br>
            <label>Email: <input type="email" id="email"></label><br>
            <label>Telefon: <input type="tel" id="telefon"></label><br>
            <button id="confirmBookingBtn">Bekræft booking</button>
        `;

        modalContent.appendChild(form);

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
        // Ryd under modal, valgfrit om du også fjerner behandling
        function clearModalBelowTreatment(removeAll = true) {
            ["dateContainer", "timeContainer", "brugerInfo"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
            if (removeAll) nextStepBtn.disabled = true;
        }
});
