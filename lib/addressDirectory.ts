export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface CityDirectoryEntry {
  name: string;

}

export interface StateDirectoryEntry {
  code: string;
  name: string;
  cities: CityDirectoryEntry[];
}

export const DEFAULT_COUNTRY_CODE = 'IN';

export const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: DEFAULT_COUNTRY_CODE,
    name: 'India',
    flag: '🇮🇳',
  },
];

export const INDIA_ADDRESS_DIRECTORY: StateDirectoryEntry[] = [
  {
    code: 'AN',
    name: 'Andaman and Nicobar Islands',
    cities: [
      { name: 'Port Blair' }
    ]
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    cities: [
      { name: 'Adoni' }, { name: 'Amaravati' }, { name: 'Anantapur' }, { name: 'Chandragiri' },
      { name: 'Chittoor' }, { name: 'Dowlaiswaram' }, { name: 'Eluru' }, { name: 'Guntur' },
      { name: 'Kadapa' }, { name: 'Kakinada' }, { name: 'Kurnool' }, { name: 'Machilipatnam' },
      { name: 'Nagarjunakoṇḍa' }, { name: 'Rajahmundry' }, { name: 'Srikakulam' }, { name: 'Tirupati' },
      { name: 'Vijayawada' }, { name: 'Visakhapatnam' }, { name: 'Vizianagaram' }, { name: 'Yemmiganur' }
    ]
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    cities: [
      { name: 'Itanagar' }
    ]
  },
  {
    code: 'AS',
    name: 'Assam',
    cities: [
      { name: 'Dhuburi' }, { name: 'Dibrugarh' }, { name: 'Dispur' }, { name: 'Guwahati' },
      { name: 'Jorhat' }, { name: 'Nagaon' }, { name: 'Sivasagar' }, { name: 'Silchar' },
      { name: 'Tezpur' }, { name: 'Tinsukia' }
    ]
  },
  {
    code: 'BR',
    name: 'Bihar',
    cities: [
      { name: 'Ara' }, { name: 'Barauni' }, { name: 'Begusarai' }, { name: 'Bettiah' },
      { name: 'Bhagalpur' }, { name: 'Bihar Sharif' }, { name: 'Bodh Gaya' }, { name: 'Buxar' },
      { name: 'Chapra' }, { name: 'Darbhanga' }, { name: 'Dehri' }, { name: 'Dinapur Nizamat' },
      { name: 'Gaya' }, { name: 'Hajipur' }, { name: 'Jamalpur' }, { name: 'Katihar' },
      { name: 'Madhubani' }, { name: 'Motihari' }, { name: 'Munger' }, { name: 'Muzaffarpur' },
      { name: 'Patna' }, { name: 'Purnia' }, { name: 'Pusa' }, { name: 'Saharsa' },
      { name: 'Samastipur' }, { name: 'Sasaram' }, { name: 'Sitamarhi' }, { name: 'Siwan' }
    ]
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    cities: [
      { name: 'Chandigarh' }
    ]
  },
  {
    code: 'CT',
    name: 'Chhattisgarh',
    cities: [
      { name: 'Ambikapur' }, { name: 'Bhilai' }, { name: 'Bilaspur' }, { name: 'Dhamtari' },
      { name: 'Durg' }, { name: 'Jagdalpur' }, { name: 'Raipur' }, { name: 'Rajnandgaon' }
    ]
  },
  {
    code: 'DN',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    cities: [
      { name: 'Daman' }, { name: 'Diu' }, { name: 'Silvassa' }
    ]
  },
  {
    code: 'DL',
    name: 'Delhi',
    cities: [
      { name: 'Delhi' }, { name: 'New Delhi' }
    ]
  },
  {
    code: 'GA',
    name: 'Goa',
    cities: [
      { name: 'Madgaon' }, { name: 'Panaji' }
    ]
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    cities: [
      { name: 'Ahmadabad' }, { name: 'Amreli' }, { name: 'Bharuch' }, { name: 'Bhavnagar' },
      { name: 'Bhuj' }, { name: 'Dwarka' }, { name: 'Gandhinagar' }, { name: 'Godhra' },
      { name: 'Jamnagar' }, { name: 'Junagadh' }, { name: 'Kandla' }, { name: 'Khambhat' },
      { name: 'Kheda' }, { name: 'Mahesana' }, { name: 'Morbi' }, { name: 'Nadiad' },
      { name: 'Navsari' }, { name: 'Okha' }, { name: 'Palanpur' }, { name: 'Patan' },
      { name: 'Porbandar' }, { name: 'Rajkot' }, { name: 'Surat' }, { name: 'Surendranagar' },
      { name: 'Valsad' }, { name: 'Veraval' }
    ]
  },
  {
    code: 'HR',
    name: 'Haryana',
    cities: [
      { name: 'Ambala' }, { name: 'Bhiwani' }, { name: 'Chandigarh' }, { name: 'Faridabad' },
      { name: 'Firozpur Jhirka' }, { name: 'Gurugram' }, { name: 'Hansi' }, { name: 'Hisar' },
      { name: 'Jind' }, { name: 'Kaithal' }, { name: 'Karnal' }, { name: 'Kurukshetra' },
      { name: 'Panipat' }, { name: 'Pehowa' }, { name: 'Rewari' }, { name: 'Rohtak' },
      { name: 'Sirsa' }, { name: 'Sonipat' }
    ]
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    cities: [
      { name: 'Bilaspur' }, { name: 'Chamba' }, { name: 'Dalhousie' }, { name: 'Dharmshala' },
      { name: 'Hamirpur' }, { name: 'Kangra' }, { name: 'Kullu' }, { name: 'Mandi' },
      { name: 'Nahan' }, { name: 'Shimla' }, { name: 'Una' }
    ]
  },
  {
    code: 'JK',
    name: 'Jammu and Kashmir',
    cities: [
      { name: 'Anantnag' }, { name: 'Baramula' }, { name: 'Doda' }, { name: 'Gulmarg' },
      { name: 'Jammu' }, { name: 'Kathua' }, { name: 'Punch' }, { name: 'Rajouri' },
      { name: 'Srinagar' }, { name: 'Udhampur' }
    ]
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    cities: [
      { name: 'Bokaro' }, { name: 'Chaibasa' }, { name: 'Deoghar' }, { name: 'Dhanbad' },
      { name: 'Dumka' }, { name: 'Giridih' }, { name: 'Hazaribag' }, { name: 'Jamshedpur' },
      { name: 'Jharia' }, { name: 'Rajmahal' }, { name: 'Ranchi' }, { name: 'Saraikela' }
    ]
  },
  {
    code: 'KA',
    name: 'Karnataka',
    cities: [
      { name: 'Badami' }, { name: 'Ballari' }, { name: 'Bengaluru' }, { name: 'Belagavi' },
      { name: 'Bhadravati' }, { name: 'Bidar' }, { name: 'Chikkamagaluru' }, { name: 'Chitradurga' },
      { name: 'Davangere' }, { name: 'Halebid' }, { name: 'Hassan' }, { name: 'Hubballi-Dharwad' },
      { name: 'Kalaburagi' }, { name: 'Kolar' }, { name: 'Madikeri' }, { name: 'Mandya' },
      { name: 'Mangaluru' }, { name: 'Mysuru' }, { name: 'Raichur' }, { name: 'Shivamogga' },
      { name: 'Shravanabelagola' }, { name: 'Shrirangapattana' }, { name: 'Tumakuru' }, { name: 'Vijayapura' }
    ]
  },
  {
    code: 'KL',
    name: 'Kerala',
    cities: [
      { name: 'Alappuzha' }, { name: 'Vatakara' }, { name: 'Idukki' }, { name: 'Kannur' },
      { name: 'Kochi' }, { name: 'Kollam' }, { name: 'Kottayam' }, { name: 'Kozhikode' },
      { name: 'Mattancheri' }, { name: 'Palakkad' }, { name: 'Thalassery' }, { name: 'Thiruvananthapuram' },
      { name: 'Thrissur' }
    ]
  },
  {
    code: 'LA',
    name: 'Ladakh',
    cities: [
      { name: 'Kargil' }, { name: 'Leh' }
    ]
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    cities: [
      { name: 'Balaghat' }, { name: 'Barwani' }, { name: 'Betul' }, { name: 'Bharhut' },
      { name: 'Bhind' }, { name: 'Bhojpur' }, { name: 'Bhopal' }, { name: 'Burhanpur' },
      { name: 'Chhatarpur' }, { name: 'Chhindwara' }, { name: 'Damoh' }, { name: 'Datia' },
      { name: 'Dewas' }, { name: 'Dhar' }, { name: 'Dr. Ambedkar Nagar (Mhow)' }, { name: 'Guna' },
      { name: 'Gwalior' }, { name: 'Hoshangabad' }, { name: 'Indore' }, { name: 'Itarsi' },
      { name: 'Jabalpur' }, { name: 'Jhabua' }, { name: 'Khajuraho' }, { name: 'Khandwa' },
      { name: 'Khargone' }, { name: 'Maheshwar' }, { name: 'Mandla' }, { name: 'Mandsaur' },
      { name: 'Morena' }, { name: 'Murwara' }, { name: 'Narsimhapur' }, { name: 'Narsinghgarh' },
      { name: 'Narwar' }, { name: 'Neemuch' }, { name: 'Nowgong' }, { name: 'Orchha' },
      { name: 'Panna' }, { name: 'Raisen' }, { name: 'Rajgarh' }, { name: 'Ratlam' },
      { name: 'Rewa' }, { name: 'Sagar' }, { name: 'Sarangpur' }, { name: 'Satna' },
      { name: 'Sehore' }, { name: 'Seoni' }, { name: 'Shahdol' }, { name: 'Shajapur' },
      { name: 'Sheopur' }, { name: 'Shivpuri' }, { name: 'Ujjain' }, { name: 'Vidisha' }
    ]
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    cities: [
      { name: 'Ahmadnagar' }, { name: 'Akola' }, { name: 'Amravati' }, { name: 'Aurangabad' },
      { name: 'Bhandara' }, { name: 'Bhusawal' }, { name: 'Bid' }, { name: 'Buldhana' },
      { name: 'Chandrapur' }, { name: 'Daulatabad' }, { name: 'Dhule' }, { name: 'Jalgaon' },
      { name: 'Kalyan' }, { name: 'Karli' }, { name: 'Kolhapur' }, { name: 'Mahabaleshwar' },
      { name: 'Malegaon' }, { name: 'Matheran' }, { name: 'Mumbai' }, { name: 'Nagpur' },
      { name: 'Nanded' }, { name: 'Nashik' }, { name: 'Osmanabad' }, { name: 'Pandharpur' },
      { name: 'Parbhani' }, { name: 'Pune' }, { name: 'Ratnagiri' }, { name: 'Sangli' },
      { name: 'Satara' }, { name: 'Sevagram' }, { name: 'Solapur' }, { name: 'Thane' },
      { name: 'Ulhasnagar' }, { name: 'Vasai-Virar' }, { name: 'Wardha' }, { name: 'Yavatmal' }
    ]
  },
  {
    code: 'MN',
    name: 'Manipur',
    cities: [
      { name: 'Imphal' }
    ]
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    cities: [
      { name: 'Cherrapunji' }, { name: 'Shillong' }
    ]
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    cities: [
      { name: 'Aizawl' }, { name: 'Lunglei' }
    ]
  },
  {
    code: 'NL',
    name: 'Nagaland',
    cities: [
      { name: 'Kohima' }, { name: 'Mon' }, { name: 'Phek' }, { name: 'Wokha' }, { name: 'Zunheboto' }
    ]
  },
  {
    code: 'OD',
    name: 'Odisha',
    cities: [
      { name: 'Balangir' }, { name: 'Baleshwar' }, { name: 'Baripada' }, { name: 'Bhubaneshwar' },
      { name: 'Brahmapur' }, { name: 'Cuttack' }, { name: 'Dhenkanal' }, { name: 'Kendujhar' },
      { name: 'Konark' }, { name: 'Koraput' }, { name: 'Paradip' }, { name: 'Phulabani' },
      { name: 'Puri' }, { name: 'Sambalpur' }, { name: 'Udayagiri' }
    ]
  },
  {
    code: 'PY',
    name: 'Puducherry',
    cities: [
      { name: 'Karaikal' }, { name: 'Mahe' }, { name: 'Puducherry' }, { name: 'Yanam' }
    ]
  },
  {
    code: 'PB',
    name: 'Punjab',
    cities: [
      { name: 'Amritsar' }, { name: 'Batala' }, { name: 'Chandigarh' }, { name: 'Faridkot' },
      { name: 'Firozpur' }, { name: 'Gurdaspur' }, { name: 'Hoshiarpur' }, { name: 'Jalandhar' },
      { name: 'Kapurthala' }, { name: 'Ludhiana' }, { name: 'Nabha' }, { name: 'Patiala' },
      { name: 'Rupnagar' }, { name: 'Sangrur' }
    ]
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    cities: [
      { name: 'Abu' }, { name: 'Ajmer' }, { name: 'Alwar' }, { name: 'Amer' }, { name: 'Barmer' },
      { name: 'Beawar' }, { name: 'Bharatpur' }, { name: 'Bhilwara' }, { name: 'Bikaner' },
      { name: 'Bundi' }, { name: 'Chittaurgarh' }, { name: 'Churu' }, { name: 'Dhaulpur' },
      { name: 'Dungarpur' }, { name: 'Ganganagar' }, { name: 'Hanumangarh' }, { name: 'Jaipur' },
      { name: 'Jaisalmer' }, { name: 'Jalor' }, { name: 'Jhalawar' }, { name: 'Jhunjhunu' },
      { name: 'Jodhpur' }, { name: 'Kishangarh' }, { name: 'Kota' }, { name: 'Merta' },
      { name: 'Nagaur' }, { name: 'Nathdwara' }, { name: 'Pali' }, { name: 'Phalodi' },
      { name: 'Pushkar' }, { name: 'Sawai Madhopur' }, { name: 'Shahpura' }, { name: 'Sikar' },
      { name: 'Sirohi' }, { name: 'Tonk' }, { name: 'Udaipur' }
    ]
  },
  {
    code: 'SK',
    name: 'Sikkim',
    cities: [
      { name: 'Gangtok' }, { name: 'Gyalshing' }, { name: 'Lachung' }, { name: 'Mangan' }
    ]
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    cities: [
      { name: 'Arcot' }, { name: 'Chengalpattu' }, { name: 'Chennai' }, { name: 'Chidambaram' },
      { name: 'Coimbatore' }, { name: 'Cuddalore' }, { name: 'Dharmapuri' }, { name: 'Dindigul' },
      { name: 'Erode' }, { name: 'Kanchipuram' }, { name: 'Kanniyakumari' }, { name: 'Kodaikanal' },
      { name: 'Kumbakonam' }, { name: 'Madurai' }, { name: 'Mamallapuram' }, { name: 'Nagappattinam' },
      { name: 'Nagercoil' }, { name: 'Palayamkottai' }, { name: 'Pudukkottai' }, { name: 'Rajapalayam' },
      { name: 'Ramanathapuram' }, { name: 'Salem' }, { name: 'Thanjavur' }, { name: 'Tiruchchirappalli' },
      { name: 'Tirunelveli' }, { name: 'Tiruppur' }, { name: 'Thoothukudi' }, { name: 'Udhagamandalam' },
      { name: 'Vellore' }
    ]
  },
  {
    code: 'TG',
    name: 'Telangana',
    cities: [
      { name: 'Hyderabad' }, { name: 'Karimnagar' }, { name: 'Khammam' }, { name: 'Mahbubnagar' },
      { name: 'Nizamabad' }, { name: 'Sangareddi' }, { name: 'Warangal' }
    ]
  },
  {
    code: 'TR',
    name: 'Tripura',
    cities: [
      { name: 'Agartala' }
    ]
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    cities: [
      { name: 'Agra' }, { name: 'Aligarh' }, { name: 'Amroha' }, { name: 'Ayodhya' }, { name: 'Azamgarh' },
      { name: 'Bahraich' }, { name: 'Ballia' }, { name: 'Banda' }, { name: 'Bara Banki' }, { name: 'Bareilly' },
      { name: 'Basti' }, { name: 'Bijnor' }, { name: 'Bithur' }, { name: 'Budaun' }, { name: 'Bulandshahr' },
      { name: 'Deoria' }, { name: 'Etah' }, { name: 'Etawah' }, { name: 'Faizabad' }, { name: 'Farrukhabad-cum-Fatehgarh' },
      { name: 'Fatehpur' }, { name: 'Fatehpur Sikri' }, { name: 'Ghaziabad' }, { name: 'Ghazipur' }, { name: 'Gonda' },
      { name: 'Gorakhpur' }, { name: 'Hamirpur' }, { name: 'Hardoi' }, { name: 'Hathras' }, { name: 'Jalaun' },
      { name: 'Jaunpur' }, { name: 'Jhansi' }, { name: 'Kannauj' }, { name: 'Kanpur' }, { name: 'Lakhimpur' },
      { name: 'Lalitpur' }, { name: 'Lucknow' }, { name: 'Mainpuri' }, { name: 'Mathura' }, { name: 'Meerut' },
      { name: 'Mirzapur-Vindhyachal' }, { name: 'Moradabad' }, { name: 'Muzaffarnagar' }, { name: 'Partapgarh' },
      { name: 'Pilibhit' }, { name: 'Prayagraj' }, { name: 'Rae Bareli' }, { name: 'Rampur' }, { name: 'Saharanpur' },
      { name: 'Sambhal' }, { name: 'Shahjahanpur' }, { name: 'Sitapur' }, { name: 'Sultanpur' }, { name: 'Tehri' },
      { name: 'Varanasi' }
    ]
  },
  {
    code: 'UT',
    name: 'Uttarakhand',
    cities: [
      { name: 'Almora' }, { name: 'Dehra Dun' }, { name: 'Haridwar' }, { name: 'Mussoorie' },
      { name: 'Nainital' }, { name: 'Pithoragarh' }
    ]
  },
  {
    code: 'WB',
    name: 'West Bengal',
    cities: [
      { name: 'Alipore' }, { name: 'Alipur Duar' }, { name: 'Asansol' }, { name: 'Baharampur' }, { name: 'Bally' },
      { name: 'Balurghat' }, { name: 'Bankura' }, { name: 'Baranagar' }, { name: 'Barasat' }, { name: 'Barrackpore' },
      { name: 'Basirhat' }, { name: 'Bhatpara' }, { name: 'Bishnupur' }, { name: 'Budge Budge' }, { name: 'Burdwan' },
      { name: 'Chandernagore' }, { name: 'Darjeeling' }, { name: 'Diamond Harbour' }, { name: 'Dum Dum' },
      { name: 'Durgapur' }, { name: 'Halisahar' }, { name: 'Haora' }, { name: 'Hugli' }, { name: 'Ingraj Bazar' },
      { name: 'Jalpaiguri' }, { name: 'Kalimpong' }, { name: 'Kamarhati' }, { name: 'Kanchrapara' }, { name: 'Kharagpur' },
      { name: 'Cooch Behar' }, { name: 'Kolkata' }, { name: 'Krishnanagar' }, { name: 'Malda' }, { name: 'Midnapore' },
      { name: 'Murshidabad' }, { name: 'Nabadwip' }, { name: 'Palashi' }, { name: 'Panihati' }, { name: 'Purulia' },
      { name: 'Raiganj' }, { name: 'Santipur' }, { name: 'Shantiniketan' }, { name: 'Shrirampur' }, { name: 'Siliguri' },
      { name: 'Siuri' }, { name: 'Tamluk' }, { name: 'Titagarh' }
    ]
  }
];

function normalizeLookupValue(value: string) {
  return value.trim().toLowerCase();
}

export function getCountryOption(countryCode?: string | null) {
  const normalizedCode = String(countryCode || DEFAULT_COUNTRY_CODE).trim().toUpperCase();
  return COUNTRY_OPTIONS.find((country) => country.code === normalizedCode) || null;
}

export function getIndianStateDirectory(stateName?: string | null) {
  const normalizedState = normalizeLookupValue(String(stateName || ''));
  return INDIA_ADDRESS_DIRECTORY.find((state) => normalizeLookupValue(state.name) === normalizedState) || null;
}

export function getIndianCityDirectory(stateName?: string | null, cityName?: string | null) {
  const state = getIndianStateDirectory(stateName);
  if (!state) {
    return null;
  }

  const normalizedCity = normalizeLookupValue(String(cityName || ''));
  return state.cities.find((city) => normalizeLookupValue(city.name) === normalizedCity) || null;
}

export function buildCustomerAddress(addressLine1: string, addressLine2?: string | null) {
  return [addressLine1.trim(), String(addressLine2 || '').trim()].filter(Boolean).join(', ');
}