export interface CollegeInfo {
  shortName: string;
  type: string;
  city: string;
  state: string;
}

const KNOWN_COLLEGES: Array<{ match: RegExp; info: CollegeInfo }> = [
  { match: /iit bombay|indian institute of technology.*bombay/i, info: { shortName: "IIT Bombay", type: "IIT", city: "Mumbai", state: "Maharashtra" } },
  { match: /iit delhi|indian institute of technology.*delhi/i, info: { shortName: "IIT Delhi", type: "IIT", city: "New Delhi", state: "Delhi" } },
  { match: /iit madras|indian institute of technology.*madras/i, info: { shortName: "IIT Madras", type: "IIT", city: "Chennai", state: "Tamil Nadu" } },
  { match: /iit kharagpur|indian institute of technology.*kharagpur/i, info: { shortName: "IIT Kharagpur", type: "IIT", city: "Kharagpur", state: "West Bengal" } },
  { match: /iit kanpur|indian institute of technology.*kanpur/i, info: { shortName: "IIT Kanpur", type: "IIT", city: "Kanpur", state: "Uttar Pradesh" } },
  { match: /iit roorkee|indian institute of technology.*roorkee/i, info: { shortName: "IIT Roorkee", type: "IIT", city: "Roorkee", state: "Uttarakhand" } },
  { match: /iit guwahati|indian institute of technology.*guwahati/i, info: { shortName: "IIT Guwahati", type: "IIT", city: "Guwahati", state: "Assam" } },
  { match: /iit hyderabad|indian institute of technology.*hyderabad/i, info: { shortName: "IIT Hyderabad", type: "IIT", city: "Hyderabad", state: "Telangana" } },
  { match: /iit bhubaneswar|indian institute of technology.*bhubaneswar/i, info: { shortName: "IIT Bhubaneswar", type: "IIT", city: "Bhubaneswar", state: "Odisha" } },
  { match: /iit gandhinagar|indian institute of technology.*gandhinagar/i, info: { shortName: "IIT Gandhinagar", type: "IIT", city: "Gandhinagar", state: "Gujarat" } },
  { match: /iit jodhpur|indian institute of technology.*jodhpur/i, info: { shortName: "IIT Jodhpur", type: "IIT", city: "Jodhpur", state: "Rajasthan" } },
  { match: /iit patna|indian institute of technology.*patna/i, info: { shortName: "IIT Patna", type: "IIT", city: "Patna", state: "Bihar" } },
  { match: /iit ropar|indian institute of technology.*ropar/i, info: { shortName: "IIT Ropar", type: "IIT", city: "Ropar", state: "Punjab" } },
  { match: /iit indore|indian institute of technology.*indore/i, info: { shortName: "IIT Indore", type: "IIT", city: "Indore", state: "Madhya Pradesh" } },
  { match: /iit mandi|indian institute of technology.*mandi/i, info: { shortName: "IIT Mandi", type: "IIT", city: "Mandi", state: "Himachal Pradesh" } },
  { match: /iit varanasi|banaras hindu university|iit bhu/i, info: { shortName: "IIT BHU", type: "IIT", city: "Varanasi", state: "Uttar Pradesh" } },
  { match: /iit tirupati|indian institute of technology.*tirupati/i, info: { shortName: "IIT Tirupati", type: "IIT", city: "Tirupati", state: "Andhra Pradesh" } },
  { match: /iit palakkad|indian institute of technology.*palakkad/i, info: { shortName: "IIT Palakkad", type: "IIT", city: "Palakkad", state: "Kerala" } },
  { match: /iit jammu|indian institute of technology.*jammu/i, info: { shortName: "IIT Jammu", type: "IIT", city: "Jammu", state: "Jammu & Kashmir" } },
  { match: /iit dharwad|indian institute of technology.*dharwad/i, info: { shortName: "IIT Dharwad", type: "IIT", city: "Dharwad", state: "Karnataka" } },
  { match: /iit bhilai|indian institute of technology.*bhilai/i, info: { shortName: "IIT Bhilai", type: "IIT", city: "Bhilai", state: "Chhattisgarh" } },
  { match: /iit goa|indian institute of technology.*goa/i, info: { shortName: "IIT Goa", type: "IIT", city: "Ponda", state: "Goa" } },
  { match: /iit (isp|ism|dhanbad)|indian school of mines/i, info: { shortName: "IIT (ISM) Dhanbad", type: "IIT", city: "Dhanbad", state: "Jharkhand" } },
  { match: /nit tiruchirappalli|nit trichy|national institute of technology.*tiruchirappalli/i, info: { shortName: "NIT Trichy", type: "NIT", city: "Tiruchirappalli", state: "Tamil Nadu" } },
  { match: /nit warangal|national institute of technology.*warangal/i, info: { shortName: "NIT Warangal", type: "NIT", city: "Warangal", state: "Telangana" } },
  { match: /nit surathkal|national institute of technology.*surathkal|national institute of technology.*karnataka/i, info: { shortName: "NIT Surathkal", type: "NIT", city: "Surathkal", state: "Karnataka" } },
  { match: /nit calicut|national institute of technology.*calicut/i, info: { shortName: "NIT Calicut", type: "NIT", city: "Kozhikode", state: "Kerala" } },
  { match: /nit rourkela|national institute of technology.*rourkela/i, info: { shortName: "NIT Rourkela", type: "NIT", city: "Rourkela", state: "Odisha" } },
  { match: /mnnit allahabad|motilal nehru national institute|national institute of technology.*allahabad/i, info: { shortName: "MNNIT Allahabad", type: "NIT", city: "Prayagraj", state: "Uttar Pradesh" } },
  { match: /nit kurukshetra|national institute of technology.*kurukshetra/i, info: { shortName: "NIT Kurukshetra", type: "NIT", city: "Kurukshetra", state: "Haryana" } },
  { match: /nit durgapur|national institute of technology.*durgapur/i, info: { shortName: "NIT Durgapur", type: "NIT", city: "Durgapur", state: "West Bengal" } },
  { match: /mnit jaipur|national institute of technology.*jaipur/i, info: { shortName: "MNIT Jaipur", type: "NIT", city: "Jaipur", state: "Rajasthan" } },
  { match: /nit srinagar|national institute of technology.*srinagar/i, info: { shortName: "NIT Srinagar", type: "NIT", city: "Srinagar", state: "Jammu & Kashmir" } },
  { match: /nit hamirpur|national institute of technology.*hamirpur/i, info: { shortName: "NIT Hamirpur", type: "NIT", city: "Hamirpur", state: "Himachal Pradesh" } },
  { match: /nit patna|national institute of technology.*patna/i, info: { shortName: "NIT Patna", type: "NIT", city: "Patna", state: "Bihar" } },
  { match: /nit silchar|national institute of technology.*silchar/i, info: { shortName: "NIT Silchar", type: "NIT", city: "Silchar", state: "Assam" } },
  { match: /vnit nagpur|national institute of technology.*nagpur|visvesvaraya national/i, info: { shortName: "VNIT Nagpur", type: "NIT", city: "Nagpur", state: "Maharashtra" } },
  { match: /manit bhopal|national institute of technology.*bhopal|maulana azad national/i, info: { shortName: "MANIT Bhopal", type: "NIT", city: "Bhopal", state: "Madhya Pradesh" } },
  { match: /nit raipur|national institute of technology.*raipur/i, info: { shortName: "NIT Raipur", type: "NIT", city: "Raipur", state: "Chhattisgarh" } },
  { match: /svnit surat|national institute of technology.*surat/i, info: { shortName: "SVNIT Surat", type: "NIT", city: "Surat", state: "Gujarat" } },
  { match: /nit agartala|national institute of technology.*agartala/i, info: { shortName: "NIT Agartala", type: "NIT", city: "Agartala", state: "Tripura" } },
  { match: /dr b r ambedkar nit jalandhar|national institute of technology.*jalandhar/i, info: { shortName: "NIT Jalandhar", type: "NIT", city: "Jalandhar", state: "Punjab" } },
  { match: /nit manipur|national institute of technology.*manipur/i, info: { shortName: "NIT Manipur", type: "NIT", city: "Imphal", state: "Manipur" } },
  { match: /nit meghalaya|national institute of technology.*meghalaya/i, info: { shortName: "NIT Meghalaya", type: "NIT", city: "Shillong", state: "Meghalaya" } },
  { match: /nit delhi|national institute of technology.*delhi/i, info: { shortName: "NIT Delhi", type: "NIT", city: "New Delhi", state: "Delhi" } },
  { match: /nit puducherry|national institute of technology.*puducherry/i, info: { shortName: "NIT Puducherry", type: "NIT", city: "Karaikal", state: "Puducherry" } },
  { match: /nit sikkim|national institute of technology.*sikkim/i, info: { shortName: "NIT Sikkim", type: "NIT", city: "Ravangla", state: "Sikkim" } },
  { match: /nit uttarakhand|national institute of technology.*uttarakhand/i, info: { shortName: "NIT Uttarakhand", type: "NIT", city: "Srinagar", state: "Uttarakhand" } },
  { match: /nit andhra pradesh|national institute of technology.*andhra/i, info: { shortName: "NIT Andhra Pradesh", type: "NIT", city: "Tadepalligudem", state: "Andhra Pradesh" } },
  { match: /nit goa|national institute of technology.*goa/i, info: { shortName: "NIT Goa", type: "NIT", city: "Ponda", state: "Goa" } },
  { match: /iiit hyderabad|international institute of information technology.*hyderabad/i, info: { shortName: "IIIT Hyderabad", type: "IIIT", city: "Hyderabad", state: "Telangana" } },
  { match: /iiit allahabad|indian institute of information technology.*allahabad/i, info: { shortName: "IIIT Allahabad", type: "IIIT", city: "Prayagraj", state: "Uttar Pradesh" } },
  { match: /iiit bangalore|international institute of information technology.*bangalore/i, info: { shortName: "IIIT Bangalore", type: "IIIT", city: "Bengaluru", state: "Karnataka" } },
  { match: /iiit delhi|indraprastha institute of information technology/i, info: { shortName: "IIIT Delhi", type: "IIIT", city: "New Delhi", state: "Delhi" } },
  { match: /abv-iiitm gwalior|atal bihari vajpayee/i, info: { shortName: "ABV-IIITM Gwalior", type: "IIIT", city: "Gwalior", state: "Madhya Pradesh" } },
  { match: /iiit kota|indian institute of information technology.*kota/i, info: { shortName: "IIIT Kota", type: "IIIT", city: "Kota", state: "Rajasthan" } },
  { match: /iiit kancheepuram|indian institute of information technology.*kancheepuram/i, info: { shortName: "IIIT Kancheepuram", type: "IIIT", city: "Kancheepuram", state: "Tamil Nadu" } },
  { match: /iiit pune|indian institute of information technology.*pune/i, info: { shortName: "IIIT Pune", type: "IIIT", city: "Pune", state: "Maharashtra" } },
  { match: /iiit sri city|indian institute of information technology.*sri city/i, info: { shortName: "IIIT Sri City", type: "IIIT", city: "Chittoor", state: "Andhra Pradesh" } },
  { match: /iiit guwahati|indian institute of information technology.*guwahati/i, info: { shortName: "IIIT Guwahati", type: "IIIT", city: "Guwahati", state: "Assam" } },
  { match: /iiit vadodara|indian institute of information technology.*vadodara/i, info: { shortName: "IIIT Vadodara", type: "IIIT", city: "Vadodara", state: "Gujarat" } },
  { match: /iiit lucknow|indian institute of information technology.*lucknow/i, info: { shortName: "IIIT Lucknow", type: "IIIT", city: "Lucknow", state: "Uttar Pradesh" } },
  { match: /iiit dharwad|indian institute of information technology.*dharwad/i, info: { shortName: "IIIT Dharwad", type: "IIIT", city: "Dharwad", state: "Karnataka" } },
  { match: /iiit kalyani|indian institute of information technology.*kalyani/i, info: { shortName: "IIIT Kalyani", type: "IIIT", city: "Kalyani", state: "West Bengal" } },
  { match: /iiit ranchi|indian institute of information technology.*ranchi/i, info: { shortName: "IIIT Ranchi", type: "IIIT", city: "Ranchi", state: "Jharkhand" } },
  { match: /iiit nagpur|indian institute of information technology.*nagpur/i, info: { shortName: "IIIT Nagpur", type: "IIIT", city: "Nagpur", state: "Maharashtra" } },
  { match: /iiit bhopal|indian institute of information technology.*bhopal/i, info: { shortName: "IIIT Bhopal", type: "IIIT", city: "Bhopal", state: "Madhya Pradesh" } },
  { match: /iiit jabalpur|indian institute of information technology.*jabalpur/i, info: { shortName: "IIIT Jabalpur", type: "IIIT", city: "Jabalpur", state: "Madhya Pradesh" } },
  { match: /iiit una|indian institute of information technology.*una/i, info: { shortName: "IIIT Una", type: "IIIT", city: "Una", state: "Himachal Pradesh" } },
  { match: /iiit manipur|indian institute of information technology.*manipur/i, info: { shortName: "IIIT Manipur", type: "IIIT", city: "Imphal", state: "Manipur" } },
  { match: /iiit surat|indian institute of information technology.*surat/i, info: { shortName: "IIIT Surat", type: "IIIT", city: "Surat", state: "Gujarat" } },
  { match: /iiit agartala|indian institute of information technology.*agartala/i, info: { shortName: "IIIT Agartala", type: "IIIT", city: "Agartala", state: "Tripura" } },
  { match: /iiit raichur|indian institute of information technology.*raichur/i, info: { shortName: "IIIT Raichur", type: "IIIT", city: "Raichur", state: "Karnataka" } },
];

export function deriveCollegeInfo(name: string): CollegeInfo {
  for (const entry of KNOWN_COLLEGES) {
    if (entry.match.test(name)) {
      return entry.info;
    }
  }

  const upper = name.toUpperCase();
  let type = "GFTI";
  if (/\bIIT\b/.test(upper) || /INDIAN INSTITUTE OF TECHNOLOGY/i.test(name)) type = "IIT";
  else if (/\bNIT\b/.test(upper) || /NATIONAL INSTITUTE OF TECHNOLOGY/i.test(name)) type = "NIT";
  else if (/\bIIIT\b/.test(upper) || /INDIAN INSTITUTE OF INFORMATION TECHNOLOGY/i.test(name)) type = "IIIT";

  const words = name.trim().split(/\s+/);
  const shortName = words.length <= 5 ? name : words.slice(0, 5).join(" ");

  return { shortName, type, city: "India", state: "India" };
}
