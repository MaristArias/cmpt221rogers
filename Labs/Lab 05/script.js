const services = [
  {
    id: 1,
    title: "Academic Success Center",
    category: "academic",
    description: "Tutoring, study planning, and academic coaching.",
    location: "Learning Commons, Room 210",
    appointmentRequired: false
  },
  {
    id: 2,
    title: "Writing Center",
    category: "academic",
    description: "Feedback on organization, evidence, and revision strategies.",
    location: "Library, Room 115",
    appointmentRequired: true
  },
  {
    id: 3,
    title: "Counseling Services",
    category: "wellness",
    description: "Confidential short-term counseling and referrals.",
    location: "Wellness Center, Floor 2",
    appointmentRequired: true
  },
  {
    id: 4,
    title: "Wellness Coaching",
    category: "wellness",
    description: "Support with sleep, stress, routines, and personal goals.",
    location: "Student Center, Room 130",
    appointmentRequired: false
  },
  {
    id: 5,
    title: "Student Help Desk",
    category: "technology",
    description: "Laptop setup, campus wifi, and account password support.",
    location: "Library, Room 020",
    appointmentRequired: false
  }
];

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const serviceList = document.querySelector("#service-list");
const serviceStatus = document.querySelector("#service-status");

function getSelectedServices(category) {
  // TODO: Return all services for "all". Otherwise, return a new array
  // containing only services whose category matches the parameter.
  if (category === "all") {
    return services;
  }

  return services.filter((service) => service.category === category);
}

function createServiceCard(service) {
  // TODO: Create the article, category, heading, description, location, and
  // appointment elements. Assign classes and text, append them in a logical
  // order, and return the completed article.
  const article = document.createElement("article");
  article.className = "service-card";
  article.dataset.serviceId = service.id;

  const category = document.createElement("p");
  category.className = "service-category";
  category.textContent = service.category;

  const heading = document.createElement("h3");
  heading.textContent = service.title;

  const description = document.createElement("p");
  description.textContent = service.description;

  const location = document.createElement("p");
  location.className = "service-location";
  location.textContent = service.location;

  const appointment = document.createElement("p");
  appointment.className = "service-appointment";
  appointment.textContent = service.appointmentRequired
    ? "Appointment required"
    : "Walk-ins welcome";

  article.append(category, heading, description, location, appointment);

  return article;
}

function renderServices(category) {
  const selectedServices = getSelectedServices(category);

  // TODO: Remove previously rendered cards.
  serviceList.replaceChildren();

  // TODO: Create and append one card for every selected service.
  selectedServices.forEach((service) => {
    serviceList.append(createServiceCard(service));
  });

  // TODO: Set aria-pressed to true only on the active filter button.
  filterButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.filter === category ? "true" : "false"
    );
  });

  // TODO: Report the empty result or the correct singular/plural count.
  if (selectedServices.length === 0) {
    serviceStatus.textContent = "No services match this category.";
  } else {
    const label = selectedServices.length === 1 ? "service" : "services";
    serviceStatus.textContent = `Showing ${selectedServices.length} ${label}.`;
  }
}

filterButtons.forEach((button) => {
  // TODO: Render this button's data-filter category when clicked.
  button.addEventListener("click", () => {
    renderServices(button.dataset.filter);
  });
});

// TODO: Render all services when the page first loads.
renderServices("all");
