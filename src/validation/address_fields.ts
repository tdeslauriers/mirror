export const STREET_ADDRESS_REGEX: RegExp = /^[a-zA-Z0-9\s,.'#-]{1,100}$/;
export const STREET_ADDRESS_2_REGEX: RegExp = /^[a-zA-Z0-9\s,.'#-]{0,100}$/;
export const CITY_REGEX: RegExp = /^[a-zA-Z\s'-]{1,50}$/;
export const STATE_REGEX: RegExp = /^[A-Z]{2}$/;
// moved state list below for readability

export const ZIP_CODE_REGEX: RegExp = /^\d{5}(-\d{4})?$/;
export const COUNTRY_REGEX: RegExp = /^[a-zA-Z\s'-]{1,56}$/;
// moved countries list below for readability

// check line 1 of the street address
export function checkStreetAddress(streetAddress: string) {
  let errors: string[] = [];

  if (!STREET_ADDRESS_REGEX.test(streetAddress)) {
    errors.push(
      "Street address must be 1-100 characters long and can include letters, numbers, spaces, commas, periods, apostrophes, hashes, and hyphens.",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check line 2 of the street address which is optional
export function checkStreetAddress2(streetAddress2: string) {
  let errors: string[] = [];

  if (
    streetAddress2.length > 0 &&
    !STREET_ADDRESS_2_REGEX.test(streetAddress2)
  ) {
    errors.push(
      "Street address line 2 must be 0-100 characters long and can include letters, numbers, spaces, commas, periods, apostrophes, hashes, and hyphens.",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check city
export function checkCity(city: string) {
  let errors: string[] = [];

  if (!CITY_REGEX.test(city)) {
    errors.push(
      "City must be 1-50 characters long and can include letters, spaces, apostrophes, and hyphens.",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check state
export function checkState(state: string) {
  let errors: string[] = [];

  if (!STATE_REGEX.test(state) || !US_STATES.includes(state)) {
    errors.push("State must be a valid 2-letter US state code.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check zip code
export function checkZipCode(zipCode: string) {
  let errors: string[] = [];

  if (!ZIP_CODE_REGEX.test(zipCode)) {
    errors.push(
      "Zip code must be a valid US zip code (5 digits or 5 digits followed by a hyphen and 4 digits).",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check country
export function checkCountry(country: string) {
  let errors: string[] = [];

  if (!COUNTRY_REGEX.test(country)) {
    errors.push(
      "Country must be 1-56 characters long and can include letters, spaces, apostrophes, and hyphens.",
    );
  } else if (!COUNTRIES.includes(country)) {
    errors.push("Country must be a valid country.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// state list
export const US_STATES: string[] = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP",
];

// countries list
export const COUNTRIES: string[] = [
  "United States",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];
