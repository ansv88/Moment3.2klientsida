/* Navigering */
const links = document.querySelectorAll(".link");

//Loopa igenom varje sidflik och lägg till en eventlistener
links.forEach((link) => {
  link.addEventListener("click", function () {
    //Ta bort klassen active från alla flikar
    links.forEach((tab) => {
      tab.classList.remove("active");
    });

    //Lägg till klasssen active för den klickade fliken
    this.classList.add("active");
  });
});

//Händelsehanterare
document.addEventListener("DOMContentLoaded", initEventListeners, false);

//URL till webbtjänst
const jobUrl = "https://moment-3-2serversida.onrender.com";

//Funktion som hanterar formulärskick (förhindrar standardbeteendet och kör addJob)
function handleFormSubmit(event) {
  event.preventDefault();
  addJob();
}

//Funktion för att skapa händelsehanterare när sidan har laddats
function initEventListeners() {
  //Försök hämta formulärelementet från DOM
  const jobInputForm = document.getElementById("jobInput");
  if (jobInputForm) {
    //Om formulärelementet finns, lägg till händelsehanterare
    jobInputForm.addEventListener("submit", handleFormSubmit, false);
  }

  //Försök hämta elementet där jobb ska visas från DOM
  const displayJobsEl = document.getElementById("displayJobs");
  if (displayJobsEl) {
    // Om elementet finns, kör funktionen för att hämta och visa jobb
    getJobs();
  }
}

//Funktion för att hämta och visa alla arbetslivserfareneheter i databasen
async function getJobs() {
  const displayJobsEl = document.getElementById("displayJobs");

  //Visa en laddningstext medan datan hämtas
  displayJobsEl.innerHTML =
    "<p>Läser in arbetslivserfarenhet från server. <br>Vänligen vänta.</p>";

  try {
    //AJAX-anrop med FetchAPI

    const response = await fetch(`${jobUrl}/dt207g/workexperiences`);
    //Om inte anropet fungerar, returnera statuskod och text
    if (!response.ok) {
      throw new Error(
        `Ett fel uppstod: ${response.status} ${response.statusText}`
      );
    }

    const jobs = await response.json();

    //Om det inte finns några jobb att visa, avbryt funktionen
    if (!jobs.length) {
      displayJobsEl.innerHTML = `<p>Inga arbetslivserfarenheter hittades.</p>`;
      return;
    }

    //Rensa laddningstexten
    displayJobsEl.innerHTML = "";

    //Sortera jobben efter startdatum i fallande ordning
    jobs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    //Skapa HTML för varje jobb och lägg till det i displayElement
    jobs.forEach((job) => {
      const jobElement = document.createElement("div");
      jobElement.className = "job";
      jobElement.innerHTML = `
                    <h2>${job.jobtitle}</h2>
                    <p>Arbetsplats: ${job.companyname}</p>
                    <p>Ort: ${job.location}</p>
                    <p>Startdatum: ${new Date(
                      job.start_date
                    ).toLocaleDateString()}</p>
                    <p>Slutdatum: ${
                      job.end_date
                        ? new Date(job.end_date).toLocaleDateString()
                        : "Pågående"
                    }</p>
                    <p>Beskrivning: ${job.description}</p>
                    <button class="deleteButton" data-id="${job._id}">Ta bort</button>
                `;
      displayJobsEl.appendChild(jobElement);
    });

    document.querySelectorAll('.deleteButton').forEach(button => {
      button.addEventListener('click', function() {
        const jobId = this.getAttribute('data-id');
        deleteJob(jobId);
      });
    });

  } catch (error) {
    console.error("Error:", error);
    displayJobsEl.innerHTML = `<p>Fel vid hämtning av arbetslivserfarenheter: ${error.message}</p>`;
  }
}

//Funktion för att lägga till en arbetslivserfarenhet
async function addJob() {
  //Hämta inputvärden från formulärfälten
  const companyName = document.getElementById("companyname").value;
  const jobTitle = document.getElementById("jobtitle").value;
  const location = document.getElementById("location").value;
  const startDate = document.getElementById("start_date").value;
  const endDate = document.getElementById("end_date").value;
  const description = document.getElementById("description").value;

  //Rensa tidigare felmeddelanden
  document.querySelectorAll(".error-text").forEach((error) => (error.textContent = ""));

  let isValid = true;

  //Validera varje inputfält och visa felmeddelanden
  if (!jobTitle) {
    document.getElementById("jobtitle-error").textContent =
      "Vänligen ange befattning/yrkesroll.";
    isValid = false;
  }
  if (!companyName) {
    document.getElementById("companyname-error").textContent =
      "Vänligen ange arbetsplats/företag.";
    isValid = false;
  }
  if (!location) {
    document.getElementById("location-error").textContent =
      "Vänligen ange arbetsort.";
    isValid = false;
  }
  if (!startDate) {
    document.getElementById("start_date-error").textContent =
      "Vänligen ange startdatum.";
    isValid = false;
  }
  if (!description) {
    document.getElementById("description-error").textContent =
      "Vänligen ange en beskrivning av arbetsuppgifter.";
    isValid = false;
  }

  //Om formuläret inte är giltigt, avbryt funktionen
  if (!isValid) {
    return;
  }

  //Skapa ett objekt för att skicka datan
  const jobData = {
    companyname: companyName,
    jobtitle: jobTitle,
    location: location,
    start_date: startDate,
    end_date: endDate,
    description: description,
  };

  //AJAX-anrop med FetchAPI
  try {
    // const response = await fetch(jobUrl, {
    const response = await fetch(`${jobUrl}/workexperience`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    //Om inte anropet fungerar, returnera statuskod och text
    if (!response.ok) {
      throw new Error(
        `Ett fel uppstod: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();
    document.getElementById("jobInput").reset(); //Töm formuläret
    document.getElementById("confirmText").innerHTML = `<p>Arbetslivserfarenhet tillagd!</p>`;
     console.log("Success:", responseData);

    window.scrollTo({ top: 0, behavior: 'smooth' });     //Scrolla till toppen av sidan när arbetslivserfarenheten är tillagd

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("errorText").innerHTML = `<p>Det gick inte att lägga till arbetslivserfarenheten.</p><p>Försök igen senare.</p>`;
  }
}

//Funktion för att ta bort jobb
async function deleteJob(_id) {
  if (
    !confirm("Är du säker på att du vill ta bort denna arbetslivserfarenhet?")
  ) {
    return;
  }

  const deleteUrl = `${jobUrl}/workexperience/${_id}`;

  //AJAX-anrop med FetchAPI
  try {
    const response = await fetch(deleteUrl, { method: "DELETE" });
    //Om inte anropet fungerar, returnera statuskod och text
    if (!response.ok) {
      throw new Error(
        `Ett fel uppstod: ${response.status} ${response.statusText}`
      );
    }

    document.getElementById("confirmText").innerHTML = `<p>[ Arbetslivserfarenheten har tagits bort ]</p>`;

    window.scrollTo({ top: 0, behavior: 'smooth' }); //Scrolla till toppen av sidan när arbetslivserfarenheten är tillagd

    document.getElementById("displayJobs").innerHTML ="<p>Uppdaterar listan...</p>";
    await getJobs(); //Uppdatera listan av jobb
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("errorText").innerHTML = `<p>Det gick inte att ta bort arbetslivserfarenheten.</p><p>Försök igen senare.</p>`;
  }
}
