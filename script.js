// ===== Validation rules: one entry per field =====
// required: must have a value | min: minimum length (checked only if a value exists)
const rules = {
  studentId:  { label: "Student ID",  required: true,  min: 5 },
  prefix:     { label: "Prefix",      required: false, min: 2 },
  firstName:  { label: "First name",  required: true,  min: 3 },
  middleName: { label: "Middle name", required: false, min: 2 },
  lastName:   { label: "Last name",   required: true,  min: 2 },
  suffix:     { label: "Suffix",      required: false, min: 2 },
  email:      { label: "Email",       required: true },
  course:     { label: "Course",      required: true },
  major:      { label: "Major",       required: true },   // only enforced when course is BSIT
  year:       { label: "Year level",  required: true },
};

const form = document.getElementById("enrollForm");
const majorField = document.getElementById("majorField");
const tableBody = document.getElementById("tableBody");
const toast = document.getElementById("toast");
const $ = (id) => document.getElementById(id);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an error message, or "" if the field is valid
function validate(name) {
  const { label, required, min } = rules[name];
  const value = $(name).value.trim();

  if (name === "major" && $("course").value !== "BSIT") return "";
  if (!value) return required ? `${label} is required.` : "";
  if (min && value.length < min) return `${label} must be at least ${min} characters.`;
  if (name === "email" && !EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  return "";
}

// Show or clear the error text + border state for one field
function showError(name, message) {
  const field = $(name).closest(".field");
  field.querySelector(".error").textContent = message;
  field.classList.toggle("invalid", !!message);
  field.classList.toggle("valid", !message && $(name).value.trim() !== "");
}

// Show the Major dropdown only for BSIT
function toggleMajor() {
  const isBSIT = $("course").value === "BSIT";
  majorField.hidden = !isBSIT;
  if (!isBSIT) { $("major").value = ""; showError("major", ""); }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function addRow(data) {
  tableBody.querySelector(".empty")?.remove();
  const fullName = [data.prefix, data.firstName, data.middleName, data.lastName, data.suffix]
    .filter(Boolean).join(" ");
  const row = tableBody.insertRow();
  [data.studentId, fullName, data.email, data.course, data.major || "—", data.year]
    .forEach((text) => { row.insertCell().textContent = text; });  // textContent avoids HTML injection
}

// ===== Events =====
// Clear/refresh errors immediately as the user types or changes a value
Object.keys(rules).forEach((name) => {
  $(name).addEventListener("input", () => showError(name, validate(name)));
});
$("course").addEventListener("change", toggleMajor);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const names = Object.keys(rules);
  let hasError = false;
  names.forEach((name) => {
    const message = validate(name);
    showError(name, message);
    hasError ||= !!message;
  });
  if (hasError) return;

  const data = Object.fromEntries(names.map((n) => [n, $(n).value.trim()]));
  addRow(data);
  form.reset();
  names.forEach((n) => showError(n, ""));
  toggleMajor();
  showToast("Student enrolled successfully!");
});