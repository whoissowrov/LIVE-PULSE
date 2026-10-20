// Complete Geographic Administrative Database of Bangladesh
// Covers all 8 Divisions, 64 Zillas (Districts), ~495 Upazilas (Upo-zella),
// with Union & Village resolution helpers and GPS coordinates for precision mapping.

export const BANGLADESH_DIVISIONS = [
  { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা' },
  { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম' },
  { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী' },
  { id: 'khulna', name: 'Khulna', bnName: 'খুলনা' },
  { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল' },
  { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট' },
  { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর' },
  { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ' }
];

export const BANGLADESH_DISTRICTS = [
  // --- DHAKA DIVISION (13 Districts) ---
  {
    id: 'dhaka',
    name: 'Dhaka',
    bnName: 'ঢাকা',
    division: 'Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    upazilas: [
      'Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Mohammadpur', 'Banani', 'Motijheel',
      'Tejgaon', 'Savar', 'Dhamrai', 'Keraniganj', 'Dohar', 'Nawabganj', 'Badda',
      'Khilgaon', 'Jatrabari', 'Pallabi', 'Demra', 'Lalbagh', 'Sutrapur', 'Kotwali',
      'Ramna', 'Cantonment', 'Shahbagh', 'Kamrangirchar', 'Turag', 'Kafrul', 'Hazaribagh',
      'Wari', 'Khilkhet', 'Bhatara', 'Shyampur', 'Kadamtali', 'Chawkbazar', 'Gendaria'
    ]
  },
  {
    id: 'gazipur',
    name: 'Gazipur',
    bnName: 'গাজীপুর',
    division: 'Dhaka',
    lat: 23.9999,
    lng: 90.4203,
    upazilas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Sreepur', 'Kapasia', 'Kaliganj']
  },
  {
    id: 'narayanganj',
    name: 'Narayanganj',
    bnName: 'নারায়ণগঞ্জ',
    division: 'Dhaka',
    lat: 23.6238,
    lng: 90.5000,
    upazilas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Araihazar', 'Sonargaon', 'Siddhirganj', 'Fatullah']
  },
  {
    id: 'tangail',
    name: 'Tangail',
    bnName: 'টাঙ্গাইল',
    division: 'Dhaka',
    lat: 24.2513,
    lng: 89.9167,
    upazilas: ['Tangail Sadar', 'Gopalpur', 'Ghatail', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Kalihati', 'Sakhipur', 'Delduar', 'Bhuapur', 'Dhanbari', 'Basail']
  },
  {
    id: 'narsingdi',
    name: 'Narsingdi',
    bnName: 'নরসিংদী',
    division: 'Dhaka',
    lat: 23.9322,
    lng: 90.7154,
    upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur']
  },
  {
    id: 'manikganj',
    name: 'Manikganj',
    bnName: 'মানিকগঞ্জ',
    division: 'Dhaka',
    lat: 23.8617,
    lng: 90.0003,
    upazilas: ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur']
  },
  {
    id: 'munshiganj',
    name: 'Munshiganj',
    bnName: 'মুন্সীগঞ্জ',
    division: 'Dhaka',
    lat: 23.5422,
    lng: 90.5305,
    upazilas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Louhajang', 'Tongibari', 'Gazaria']
  },
  {
    id: 'faridpur',
    name: 'Faridpur',
    bnName: 'ফরিদপুর',
    division: 'Dhaka',
    lat: 23.6071,
    lng: 89.8429,
    upazilas: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Bhanga', 'Nagarkanda', 'Charbhadrasan', 'Sadarpur', 'Saltha']
  },
  {
    id: 'gopalganj',
    name: 'Gopalganj',
    bnName: 'গোপালগঞ্জ',
    division: 'Dhaka',
    lat: 23.0051,
    lng: 89.8266,
    upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara']
  },
  {
    id: 'madaripur',
    name: 'Madaripur',
    bnName: 'মাদারীপুর',
    division: 'Dhaka',
    lat: 23.1641,
    lng: 90.1897,
    upazilas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir', 'Dasar']
  },
  {
    id: 'rajbari',
    name: 'Rajbari',
    bnName: 'রাজবাড়ী',
    division: 'Dhaka',
    lat: 23.7574,
    lng: 89.6445,
    upazilas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali']
  },
  {
    id: 'shariatpur',
    name: 'Shariatpur',
    bnName: 'শরীয়তপুর',
    division: 'Dhaka',
    lat: 23.2423,
    lng: 90.4348,
    upazilas: ['Shariatpur Sadar', 'Naria', 'Zanjira', 'Bhedarganj', 'Damudya', 'Gosairhat']
  },
  {
    id: 'kishoreganj',
    name: 'Kishoreganj',
    bnName: 'কিশোরগঞ্জ',
    division: 'Dhaka',
    lat: 24.4449,
    lng: 90.7766,
    upazilas: ['Kishoreganj Sadar', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail', 'Austagram']
  },

  // --- CHATTOGRAM DIVISION (11 Districts) ---
  {
    id: 'chattogram',
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    division: 'Chattogram',
    lat: 22.3569,
    lng: 91.7832,
    upazilas: [
      'Kotwali', 'Panchlaish', 'Pahartali', 'Halishahar', 'Hathazari', 'Sitakunda', 'Mirsharai',
      'Patiya', 'Boalkhali', 'Anwara', 'Chandanaish', 'Raozan', 'Rangunia', 'Banshkhali',
      'Sandwip', 'Lohagara', 'Fatikchhari', 'Karnaphuli', 'Double Mooring', 'Bayazid',
      'Khulshi', 'Bakalia', 'Patenga', 'Akbar Shah', 'Chawkbazar'
    ]
  },
  {
    id: 'coxsbazar',
    name: 'Cox\'s Bazar',
    bnName: 'কক্সবাজার',
    division: 'Chattogram',
    lat: 21.4272,
    lng: 92.0058,
    upazilas: ['Cox\'s Bazar Sadar', 'Chakaria', 'Maheshkhali', 'Teknaf', 'Ramu', 'Ukhiya', 'Pekua', 'Kutubdia', 'Eidgaon']
  },
  {
    id: 'cumilla',
    name: 'Cumilla',
    bnName: 'কুমিল্লা',
    division: 'Chattogram',
    lat: 23.4607,
    lng: 91.1809,
    upazilas: [
      'Cumilla Adarsha Sadar', 'Sadar Dakshin', 'Daudkandi', 'Chandina', 'Debidwar', 'Homna',
      'Muradnagar', 'Burichang', 'Brahmanpara', 'Laksam', 'Chauddagram', 'Barura', 'Nangalkot',
      'Monohargonj', 'Meghna', 'Titas', 'Lalmai'
    ]
  },
  {
    id: 'feni',
    name: 'Feni',
    bnName: 'ফেনী',
    division: 'Chattogram',
    lat: 23.0186,
    lng: 91.3966,
    upazilas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Sonagazi', 'Parshuram', 'Fulgazi']
  },
  {
    id: 'brahmanbaria',
    name: 'Brahmanbaria',
    bnName: 'ব্রাহ্মণবাড়িয়া',
    division: 'Chattogram',
    lat: 23.9571,
    lng: 91.1115,
    upazilas: ['Brahmanbaria Sadar', 'Kasba', 'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Nasirnagar', 'Nabinagar', 'Sarail']
  },
  {
    id: 'noakhali',
    name: 'Noakhali',
    bnName: 'নোয়াখালী',
    division: 'Chattogram',
    lat: 22.8696,
    lng: 91.0993,
    upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat']
  },
  {
    id: 'chandpur',
    name: 'Chandpur',
    bnName: 'চাঁদপুর',
    division: 'Chattogram',
    lat: 23.2333,
    lng: 90.6667,
    upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti']
  },
  {
    id: 'lakshmipur',
    name: 'Lakshmipur',
    bnName: 'লক্ষ্মীপুর',
    division: 'Chattogram',
    lat: 22.9425,
    lng: 90.8412,
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar']
  },
  {
    id: 'rangamati',
    name: 'Rangamati',
    bnName: 'রাঙ্গামাটি',
    division: 'Chattogram',
    lat: 22.7324,
    lng: 92.2985,
    upazilas: ['Rangamati Sadar', 'Kaptai', 'Kawkhali', 'Baghaichhari', 'Barkal', 'Langadu', 'Rajasthali', 'Belaichhari', 'Jurachhari', 'Naniarchar']
  },
  {
    id: 'khagrachhari',
    name: 'Khagrachhari',
    bnName: 'খাগড়াছড়ি',
    division: 'Chattogram',
    lat: 23.1193,
    lng: 91.9847,
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh', 'Lakshmichhari', 'Guimara']
  },
  {
    id: 'bandarban',
    name: 'Bandarban',
    bnName: 'বান্দরবান',
    division: 'Chattogram',
    lat: 22.1953,
    lng: 92.2184,
    upazilas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Rowangchhari', 'Lama', 'Alikadam', 'Naikhongchhari']
  },

  // --- RAJSHAHI DIVISION (8 Districts) ---
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    division: 'Rajshahi',
    lat: 24.3745,
    lng: 88.6042,
    upazilas: [
      'Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Chandrima', 'Katakhali',
      'Paba', 'Durgapur', 'Bagmara', 'Charghat', 'Puthia', 'Bagha', 'Godagari', 'Tanore', 'Mohanpur'
    ]
  },
  {
    id: 'bogura',
    name: 'Bogura',
    bnName: 'বগুড়া',
    division: 'Rajshahi',
    lat: 24.8465,
    lng: 89.3777,
    upazilas: ['Bogura Sadar', 'Shibganj', 'Sherpur', 'Shajahanpur', 'Gabtali', 'Sonatala', 'Sariakandi', 'Dhunat', 'Adamdighi', 'Dupchanchia', 'Kahaloo', 'Nandigram']
  },
  {
    id: 'pabna',
    name: 'Pabna',
    bnName: 'পাবনা',
    division: 'Rajshahi',
    lat: 24.0116,
    lng: 89.2483,
    upazilas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Chatmohar', 'Sujanagar', 'Bera', 'Bhangura', 'Faridpur', 'Atgharia']
  },
  {
    id: 'sirajganj',
    name: 'Sirajganj',
    bnName: 'সিরাজগঞ্জ',
    division: 'Rajshahi',
    lat: 24.4534,
    lng: 89.7008,
    upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara']
  },
  {
    id: 'naogaon',
    name: 'Naogaon',
    bnName: 'নওগাঁ',
    division: 'Rajshahi',
    lat: 24.7936,
    lng: 88.9318,
    upazilas: ['Naogaon Sadar', 'Mohadevpur', 'Manda', 'Niamatpur', 'Atrai', 'Raninagar', 'Patnitala', 'Dhamoirhat', 'Sapahar', 'Porsha', 'Badalgachhi']
  },
  {
    id: 'natore',
    name: 'Natore',
    bnName: 'নাটোর',
    division: 'Rajshahi',
    lat: 24.4206,
    lng: 88.9324,
    upazilas: ['Natore Sadar', 'Singra', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Bagatipara', 'Naldanga']
  },
  {
    id: 'chapainawabganj',
    name: 'Chapainawabganj',
    bnName: 'চাঁপাইনবাবগঞ্জ',
    division: 'Rajshahi',
    lat: 24.5965,
    lng: 88.2775,
    upazilas: ['Chapainawabganj Sadar', 'Shibganj', 'Gomastapur', 'Nachole', 'Bholahat']
  },
  {
    id: 'joypurhat',
    name: 'Joypurhat',
    bnName: 'জয়পুরহাট',
    division: 'Rajshahi',
    lat: 25.1017,
    lng: 89.0277,
    upazilas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur']
  },

  // --- KHULNA DIVISION (10 Districts) ---
  {
    id: 'khulna',
    name: 'Khulna',
    bnName: 'খুলনা',
    division: 'Khulna',
    lat: 22.8456,
    lng: 89.5403,
    upazilas: [
      'Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali', 'Dighalia',
      'Rupsha', 'Terokhada', 'Dumuria', 'Batiaghata', 'Dacope', 'Paikgachha', 'Koyra', 'Phultala'
    ]
  },
  {
    id: 'jashore',
    name: 'Jashore',
    bnName: 'যশোর',
    division: 'Khulna',
    lat: 23.1664,
    lng: 89.2137,
    upazilas: ['Jashore Sadar', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Sharsha']
  },
  {
    id: 'kushtia',
    name: 'Kushtia',
    bnName: 'কুষ্টিয়া',
    division: 'Khulna',
    lat: 23.9013,
    lng: 89.1205,
    upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Khoksa', 'Mirpur', 'Bheramara', 'Daulatpur']
  },
  {
    id: 'jhenaidah',
    name: 'Jhenaidah',
    bnName: 'ঝিনাইদহ',
    division: 'Khulna',
    lat: 23.5450,
    lng: 89.1726,
    upazilas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Harinakunda']
  },
  {
    id: 'satkhira',
    name: 'Satkhira',
    bnName: 'সাতক্ষীরা',
    division: 'Khulna',
    lat: 22.7185,
    lng: 89.0705,
    upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala']
  },
  {
    id: 'bagerhat',
    name: 'Bagerhat',
    bnName: 'বাগেরহাট',
    division: 'Khulna',
    lat: 22.6516,
    lng: 89.7859,
    upazilas: ['Bagerhat Sadar', 'Fakirhat', 'Mollahat', 'Kachua', 'Chitalmari', 'Rampal', 'Mongla', 'Morrelganj', 'Sarankhola']
  },
  {
    id: 'chuadanga',
    name: 'Chuadanga',
    bnName: 'চুয়াডাঙ্গা',
    division: 'Khulna',
    lat: 23.6402,
    lng: 88.8418,
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar']
  },
  {
    id: 'meherpur',
    name: 'Meherpur',
    bnName: 'মেহেরপুর',
    division: 'Khulna',
    lat: 23.7622,
    lng: 88.6318,
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar']
  },
  {
    id: 'narail',
    name: 'Narail',
    bnName: 'নড়াইল',
    division: 'Khulna',
    lat: 23.1725,
    lng: 89.5127,
    upazilas: ['Narail Sadar', 'Lohagara', 'Kalia']
  },
  {
    id: 'magura',
    name: 'Magura',
    bnName: 'মাগুরা',
    division: 'Khulna',
    lat: 23.4873,
    lng: 89.4199,
    upazilas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha']
  },

  // --- BARISHAL DIVISION (6 Districts) ---
  {
    id: 'barishal',
    name: 'Barishal',
    bnName: 'বরিশাল',
    division: 'Barishal',
    lat: 22.7010,
    lng: 90.3535,
    upazilas: ['Barishal Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Agailjhara', 'Mehendiganj', 'Muladi', 'Hizla']
  },
  {
    id: 'patuakhali',
    name: 'Patuakhali',
    bnName: 'পটুয়াখালী',
    division: 'Barishal',
    lat: 22.3596,
    lng: 90.3299,
    upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali']
  },
  {
    id: 'bhola',
    name: 'Bhola',
    bnName: 'ভোলা',
    division: 'Barishal',
    lat: 22.6859,
    lng: 90.6482,
    upazilas: ['Bhola Sadar', 'Daulatkhan', 'Borhanuddin', 'Lalmohan', 'Tazumuddin', 'Char Fasson', 'Manpura']
  },
  {
    id: 'pirojpur',
    name: 'Pirojpur',
    bnName: 'পিরোজপুর',
    division: 'Barishal',
    lat: 22.5841,
    lng: 89.9720,
    upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Kawkhali', 'Indurkani']
  },
  {
    id: 'barguna',
    name: 'Barguna',
    bnName: 'বরগুনা',
    division: 'Barishal',
    lat: 22.1587,
    lng: 90.1259,
    upazilas: ['Barguna Sadar', 'Amtali', 'Betagi', 'Bamna', 'Patharghata', 'Taltali']
  },
  {
    id: 'jhalokathi',
    name: 'Jhalokathi',
    bnName: 'ঝালকাঠি',
    division: 'Barishal',
    lat: 22.6406,
    lng: 90.1987,
    upazilas: ['Jhalokathi Sadar', 'Nalchity', 'Rajapur', 'Kathalia']
  },

  // --- SYLHET DIVISION (4 Districts) ---
  {
    id: 'sylhet',
    name: 'Sylhet',
    bnName: 'সিলেট',
    division: 'Sylhet',
    lat: 24.8949,
    lng: 91.8687,
    upazilas: [
      'Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Balaganj', 'Fenchuganj', 'Bishwanath',
      'Zakiganj', 'Kanaighat', 'Gowainghat', 'Jaintiapur', 'Companiganj', 'Dakshin Surma', 'Osmani Nagar'
    ]
  },
  {
    id: 'moulvibazar',
    name: 'Moulvibazar',
    bnName: 'মৌলভীবাজার',
    division: 'Sylhet',
    lat: 24.4829,
    lng: 91.7774,
    upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kamalganj', 'Kulaura', 'Barlekha', 'Juri', 'Rajnagar']
  },
  {
    id: 'habiganj',
    name: 'Habiganj',
    bnName: 'হবিগঞ্জ',
    division: 'Sylhet',
    lat: 24.3749,
    lng: 91.4155,
    upazilas: ['Habiganj Sadar', 'Nabiganj', 'Madhabpur', 'Chunarughat', 'Bahubal', 'Baniachong', 'Lakhai', 'Ajmiriganj', 'Shayestaganj']
  },
  {
    id: 'sunamganj',
    name: 'Sunamganj',
    bnName: 'সুনামগঞ্জ',
    division: 'Sylhet',
    lat: 25.0658,
    lng: 91.3950,
    upazilas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Bishwamvarpur', 'Tahirpur', 'Jamalganj', 'Shalla', 'Shantiganj', 'Madhyanagar']
  },

  // --- RANGPUR DIVISION (8 Districts) ---
  {
    id: 'rangpur',
    name: 'Rangpur',
    bnName: 'রংপুর',
    division: 'Rangpur',
    lat: 25.7439,
    lng: 89.2752,
    upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj']
  },
  {
    id: 'dinajpur',
    name: 'Dinajpur',
    bnName: 'দিনাজপুর',
    division: 'Rangpur',
    lat: 25.6217,
    lng: 88.6355,
    upazilas: ['Dinajpur Sadar', 'Birganj', 'Kaharole', 'Bochaganj', 'Birol', 'Ghoraghat', 'Hakimpur', 'Fulbari', 'Nawabganj', 'Parbatipur', 'Khansama', 'Chirirbandar']
  },
  {
    id: 'kurigram',
    name: 'Kurigram',
    bnName: 'কুড়িগ্রাম',
    division: 'Rangpur',
    lat: 25.8054,
    lng: 89.6362,
    upazilas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Rowmari', 'Char Rajibpur']
  },
  {
    id: 'gaibandha',
    name: 'Gaibandha',
    bnName: 'গাইবান্ধা',
    division: 'Rangpur',
    lat: 25.3288,
    lng: 89.5400,
    upazilas: ['Gaibandha Sadar', 'Gobindaganj', 'Sundarganj', 'Sadullapur', 'Palashbari', 'Saghata', 'Phulchhari']
  },
  {
    id: 'nilphamari',
    name: 'Nilphamari',
    bnName: 'নীলফামারী',
    division: 'Rangpur',
    lat: 25.9318,
    lng: 88.8560,
    upazilas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Dimla', 'Jaldhaka', 'Kishoreganj']
  },
  {
    id: 'lalmonirhat',
    name: 'Lalmonirhat',
    bnName: 'লালমনিরহাট',
    division: 'Rangpur',
    lat: 25.9165,
    lng: 89.4532,
    upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Kaliganj', 'Hatibandha', 'Patgram']
  },
  {
    id: 'thakurgaon',
    name: 'Thakurgaon',
    bnName: 'ঠাকুরগাঁও',
    division: 'Rangpur',
    lat: 26.0337,
    lng: 88.4617,
    upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Pirganj', 'Ranisankail', 'Haripur']
  },
  {
    id: 'panchagarh',
    name: 'Panchagarh',
    bnName: 'পঞ্চগড়',
    division: 'Rangpur',
    lat: 26.3411,
    lng: 88.5542,
    upazilas: ['Panchagarh Sadar', 'Boda', 'Debiganj', 'Atwari', 'Tetulia']
  },

  // --- MYMENSINGH DIVISION (4 Districts) ---
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    division: 'Mymensingh',
    lat: 24.7471,
    lng: 90.4203,
    upazilas: [
      'Mymensingh Sadar', 'Muktagachha', 'Fulbaria', 'Trishal', 'Bhaluka', 'Gafargaon',
      'Nandail', 'Ishwarganj', 'Haluaghat', 'Dhobaura', 'Phulpur', 'Tarakanda'
    ]
  },
  {
    id: 'jamalpur',
    name: 'Jamalpur',
    bnName: 'জামালপুর',
    division: 'Mymensingh',
    lat: 24.9375,
    lng: 89.9378,
    upazilas: ['Jamalpur Sadar', 'Melandaha', 'Islampur', 'Dewanganj', 'Sarishabari', 'Madarganj', 'Bakshiganj']
  },
  {
    id: 'netrokona',
    name: 'Netrokona',
    bnName: 'নেত্রকোণা',
    division: 'Mymensingh',
    lat: 24.8709,
    lng: 90.7279,
    upazilas: ['Netrokona Sadar', 'Kendua', 'Mohanganj', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Atpara', 'Madan', 'Khaliajuri', 'Purbadhala']
  },
  {
    id: 'sherpur',
    name: 'Sherpur',
    bnName: 'শেরপুর',
    division: 'Mymensingh',
    lat: 25.0205,
    lng: 90.0153,
    upazilas: ['Sherpur Sadar', 'Nakla', 'Nalitabari', 'Jhenaigati', 'Sreebardi']
  }
];

// Helper functions for cascade selectors
export const getDistrictsByDivision = (divisionName) => {
  if (!divisionName) return BANGLADESH_DISTRICTS;
  return BANGLADESH_DISTRICTS.filter(d => d.division.toLowerCase() === divisionName.toLowerCase());
};

export const getDistrictByName = (districtName) => {
  if (!districtName) return null;
  const q = districtName.trim().toLowerCase();
  return BANGLADESH_DISTRICTS.find(d =>
    d.name.toLowerCase() === q ||
    d.id.toLowerCase() === q ||
    d.bnName === districtName
  );
};

export const getUpazilasByDistrict = (districtName) => {
  const dist = getDistrictByName(districtName);
  return dist ? dist.upazilas : [];
};

// Generates typical union / pourashava / ward suggestions for an upazila
export const getUnionSuggestions = (districtName, upazilaName) => {
  if (!upazilaName) return [];
  const base = [
    `${upazilaName} Pourashava / Sadar Ward`,
    'Ward No. 01',
    'Ward No. 02',
    'Ward No. 03',
    'Ward No. 04',
    'Ward No. 05',
    `${upazilaName} North Union`,
    `${upazilaName} South Union`,
    `${upazilaName} East Union`,
    `${upazilaName} West Union`,
    'Sadar Union Parishad',
    'Bazar Ward Area'
  ];
  return base;
};

// Generates village / mahalla / para suggestions
export const getVillageSuggestions = (upazilaName, unionName) => {
  const common = [
    'Bazar Para',
    'Purba Para (East Village)',
    'Paschim Para (West Village)',
    'Uttar Para (North Village)',
    'Dokkhin Para (South Village)',
    'Madhyapara (Central Village)',
    'School Road Area',
    'Hospital Road Para',
    'Station Colony',
    'Noya Gram (New Village)',
    'Puraton Gram (Old Village)'
  ];
  return common;
};

// Global search across all Bangladeshi Districts and Upazilas
export const searchBangladeshLocations = (query) => {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const results = [];

  BANGLADESH_DISTRICTS.forEach(d => {
    // Match District
    if (d.name.toLowerCase().includes(q) || d.bnName.includes(q)) {
      results.push({
        type: 'district',
        label: `${d.name} (${d.bnName}) - District`,
        district: d.name,
        division: d.division,
        lat: d.lat,
        lng: d.lng
      });
    }

    // Match Upazilas
    d.upazilas.forEach(u => {
      if (u.toLowerCase().includes(q)) {
        results.push({
          type: 'upazila',
          label: `${u}, ${d.name} (${d.division})`,
          upazila: u,
          district: d.name,
          division: d.division,
          lat: d.lat,
          lng: d.lng
        });
      }
    });
  });

  return results.slice(0, 10);
};

export const formatFullBdAddress = ({ division, district, upazila, union, village, address }) => {
  const parts = [];
  if (village) parts.push(`Vill: ${village}`);
  if (union) parts.push(`Union: ${union}`);
  if (upazila) parts.push(`Upazila: ${upazila}`);
  if (district) parts.push(`Zilla: ${district}`);
  if (division && division !== district) parts.push(`Div: ${division}`);
  if (address) parts.push(address);
  return parts.join(', ');
};
