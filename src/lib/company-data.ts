const rawCompaniesData = [
    // --- BIG TECH & FAANG ---
    'Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Tesla', 'Nvidia', 'Alphabet',
    'Samsung', 'TSMC', 'Tencent', 'Alibaba', 'Oracle', 'Adobe', 'Salesforce', 'IBM', 'Intel',
    'AMD', 'Qualcomm', 'Cisco', 'Broadcom', 'Texas Instruments', 'Micron', 'Applied Materials',
    'Intuit', 'ServiceNow', 'Uber', 'Airbnb', 'Booking Holdings', 'PayPal', 'ADP', 'Fiserv',
    'Lam Research', 'Snowflake', 'Workday', 'Equinix', 'Atlassian', 'Autodesk', 'Synopsys',
    'Cadence Design Systems', 'Palo Alto Networks', 'MercadoLibre', 'KLA', 'Analog Devices',
    'CrowdStrike', 'Fortinet', 'Marvell Technology', 'Shopify', 'Spotify', 'Electronic Arts',
    'DoorDash', 'The Trade Desk', 'Datadog', 'MongoDB', 'Palantir', 'HubSpot', 'Cloudflare',
    'Pinterest', 'Snap', 'Zoom', 'Twilio', 'Roku', 'Unity', 'Roblox', 'Coinbase', 'Block',
    'Sea Limited', 'Grab', 'Gojek', 'Tokopedia', 'Coupang', 'Jumia', 'Rappi', 'Nubank',

    // --- CONSULTING & PROFESSIONAL SERVICES ---
    'McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte', 'PwC', 'EY', 'KPMG',
    'Accenture', 'Capgemini', 'Tata Consultancy Services', 'Infosys', 'Wipro', 'Cognizant',
    'HCL Technologies', 'Tech Mahindra', 'Globant', 'EPAM Systems', 'Thoughtworks', 'Slalom',
    'Booz Allen Hamilton', 'Gartner', 'Publicis Sapient', 'IBM iX', 'Sopra Steria', 'Atos',
    'NTT DATA', 'DXC Technology', 'CGI', 'Kyndryl', 'Softtek', 'Neoris',

    // --- FINANCE & FINTECH ---
    'JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup', 'Goldman Sachs', 'Morgan Stanley',
    'BlackRock', 'Visa', 'Mastercard', 'American Express', 'Stripe', 'Revolut', 'Wise', 'N26',
    'Monzo', 'Chime', 'Klarna', 'Affirm', 'SoFi', 'Robinhood', 'Etoro', 'Binance', 'Kraken',
    'Gemini', 'Crypto.com', 'Circle', 'Ripple', 'Plaid', 'Brex', 'Ramp', 'Mercury', 'Carta',
    'Gusto', 'Deel', 'Bill.com', 'Expensify', 'Lemonade', 'Root', 'Oscar Health', 'Hippo',
    'BBVA', 'Santander', 'CaixaBank', 'Sabadell', 'Bankinter', 'ING', 'Deutsche Bank', 'UBS',
    'Credit Suisse', 'Barclays', 'HSBC', 'BNP Paribas', 'Société Générale',

    // --- ENTERPRISE SOFTWARE & SAAS ---
    'SAP', 'Oracle', 'Salesforce', 'Workday', 'ServiceNow', 'Atlassian', 'Zoom', 'Slack',
    'Teams', 'Asana', 'Monday.com', 'Trello', 'Notion', 'Airtable', 'ClickUp', 'Linear',
    'Jira', 'Confluence', 'Figma', 'Canva', 'Miro', 'InVision', 'Sketch', 'Adobe XD',
    'DocuSign', 'Dropbox', 'Box', 'Zendesk', 'Freshworks', 'Intercom', 'Drift', 'Typeform',
    'SurveyMonkey', 'Mailchimp', 'SendGrid', 'Twilio', 'MessageBird', 'Vonage', 'RingCentral',
    'Okta', 'Auth0', 'OneLogin', 'Ping Identity', 'CyberArk', 'Splunk', 'Datadog', 'New Relic',
    'Dynatrace', 'Elastic', 'Sumo Logic', 'PagerDuty', 'GitLab', 'GitHub', 'Bitbucket',

    // --- E-COMMERCE & RETAIL ---
    'Walmart', 'Target', 'Costco', 'Home Depot', 'Lowe\'s', 'Best Buy', 'IKEA', 'Nike',
    'Adidas', 'Lululemon', 'Zara', 'H&M', 'Uniqlo', 'Shein', 'ASOS', 'Zalando', 'Farfetch',
    'Wayfair', 'Etsy', 'eBay', 'Rakuten', 'Pinduoduo', 'JD.com', 'Meituan', 'Flipkart',
    'Myntra', 'Ajio', 'Falabella', 'Cencosud', 'Liverpool', 'El Corte Inglés', 'Mango',
    'Desigual', 'Pull&Bear', 'Bershka', 'Stradivarius', 'Massimo Dutti', 'Oysho',

    // --- MEDIA, STREAMING & GAMING ---
    'Disney', 'Netflix', 'Hulu', 'HBO', 'Warner Bros', 'Paramount', 'Universal', 'Sony',
    'Nintendo', 'Xbox', 'PlayStation', 'Activision Blizzard', 'Electronic Arts', 'Ubisoft',
    'Take-Two Interactive', 'Epic Games', 'Riot Games', 'Valve', 'Roblox', 'Unity', 'Twitch',
    'YouTube', 'TikTok', 'Instagram', 'Facebook', 'Snapchat', 'Twitter', 'X', 'LinkedIn',
    'Reddit', 'Discord', 'Telegram', 'WhatsApp', 'Signal', 'Vimeo', 'Dailymotion',
    'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Deezer', 'SoundCloud', 'Pandora',

    // --- AUTOMOTIVE & TRANSPORT ---
    'Tesla', 'Rivian', 'Lucid', 'NIO', 'XPeng', 'Li Auto', 'BYD', 'Polestar', 'Waymo',
    'Cruise', 'Zoox', 'Aurora', 'Toyota', 'Volkswagen', 'Ford', 'GM', 'BMW', 'Mercedes-Benz',
    'Audi', 'Porsche', 'Honda', 'Hyundai', 'Kia', 'Volvo', 'Jaguar Land Rover', 'Stellantis',
    'Ferrari', 'Lamborghini', 'Uber', 'Lyft', 'Grab', 'Bolt', 'Cabify', 'BlaBlaCar',
    'Lime', 'Bird', 'Tier', 'Voi',

    // --- HEALTHCARE & BIOTECH ---
    'Pfizer', 'Moderna', 'Johnson & Johnson', 'Roche', 'Novartis', 'Merck', 'AbbVie',

    // --- TRAVEL & HOSPITALITY ---
    'Airbnb', 'Booking.com', 'Expedia', 'TripAdvisor', 'Skyscanner', 'Kayak', 'Agoda',
    'Marriott', 'Hilton', 'Hyatt', 'IHG', 'Accor', 'Wyndham', 'Choice Hotels',
    'Delta', 'United', 'American Airlines', 'Southwest', 'Ryanair', 'EasyJet', 'Lufthansa',
    'Air France', 'KLM', 'Iberia', 'Vueling', 'Emirates', 'Qatar Airways', 'Singapore Airlines'
];

// Eliminar duplicados y ordenar
export const companiesData = [...new Set(rawCompaniesData)].sort();

export const rolesData = [
    // === SOFTWARE DEVELOPMENT ===
    'Software Developer',
    'Junior Software Developer',
    'Senior Software Developer',
    'Software Engineer',
    'Junior Software Engineer',
    'Senior Software Engineer',
    'Staff Software Engineer',
    'Principal Software Engineer',
    'Web Developer',
    'Programmer',

    // === FRONTEND ===
    'Frontend Developer',
    'Junior Frontend Developer',
    'Senior Frontend Developer',
    'Frontend Engineer',
    'React Developer',
    'React Specialist',
    'Vue.js Developer',
    'Vue.js Specialist',
    'Angular Developer',
    'Angular Specialist',
    'JavaScript Developer',
    'TypeScript Developer',

    // === BACKEND ===
    'Backend Developer',
    'Junior Backend Developer',
    'Senior Backend Developer',
    'Backend Engineer',
    'Node.js Developer',
    'Python Developer',
    'Java Developer',
    '.NET Developer',
    'C# Developer',
    'Go Developer',
    'PHP Developer',
    'Ruby Developer',
    'Rust Developer',

    // === FULL STACK ===
    'Full Stack Developer',
    'Junior Full Stack Developer',
    'Senior Full Stack Developer',
    'Full Stack Engineer',

    // === MOBILE ===
    'Mobile Developer',
    'iOS Developer',
    'Junior iOS Developer',
    'Senior iOS Developer',
    'Swift Developer',
    'Android Developer',
    'Junior Android Developer',
    'Senior Android Developer',
    'Kotlin Developer',
    'React Native Developer',
    'Flutter Developer',

    // === DEVOPS & CLOUD ===
    'DevOps Engineer',
    'Junior DevOps Engineer',
    'Senior DevOps Engineer',
    'Site Reliability Engineer (SRE)',
    'Infrastructure Engineer',
    'Cloud Engineer',
    'AWS Engineer',
    'Azure Engineer',
    'Google Cloud Engineer',
    'Cloud Architect',
    'Platform Engineer',
    'Kubernetes Engineer',
    'Docker Engineer',

    // === QA & TESTING ===
    'QA Engineer',
    'QA Tester',
    'QA Automation Engineer',
    'Test Engineer',
    'SDET',
    'QA Analyst',

    // === DATA ===
    'Data Scientist',
    'Junior Data Scientist',
    'Senior Data Scientist',
    'Data Engineer',
    'Data Analyst',
    'Data Architect',
    'Database Administrator (DBA)',
    'Big Data Engineer',
    'ETL Developer',
    'Business Intelligence Analyst',
    'BI Analyst',

    // === AI & MACHINE LEARNING ===
    'AI Engineer',
    'AI Specialist',
    'Machine Learning Engineer',
    'Junior ML Engineer',
    'Senior ML Engineer',
    'AI Researcher',
    'Research Scientist',
    'Computer Vision Engineer',
    'NLP Engineer',
    'Deep Learning Engineer',
    'MLOps Engineer',
    'Prompt Engineer',
    'LLM Engineer',
    'GenAI Engineer',

    // === SECURITY ===
    'Security Engineer',
    'Cybersecurity Engineer',
    'Security Analyst',
    'Penetration Tester',
    'Ethical Hacker',
    'Security Architect',
    'SOC Analyst',

    // === ARCHITECTURE ===
    'Software Architect',
    'Solutions Architect',
    'Systems Architect',
    'Technical Architect',
    'Enterprise Architect',

    // === TECHNICAL LEADERSHIP ===
    'Tech Lead',
    'Technical Lead',
    'Team Lead',
    'Lead Developer',
    'Engineering Manager',
    'Director of Engineering',
    'VP of Engineering',
    'CTO',
    'Head of Engineering',

    // === PRODUCT ===
    'Product Manager',
    'Junior Product Manager',
    'Senior Product Manager',
    'Product Owner',
    'Group Product Manager',
    'Director of Product',
    'VP of Product',
    'CPO',
    'Technical Product Manager',
    'Associate Product Manager',

    // === DESIGN ===
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'UX/UI Designer',
    'UX Researcher',
    'Design Lead',
    'Director of Design',

    // === PROJECT MANAGEMENT ===
    'Project Manager',
    'Technical Project Manager',
    'Program Manager',
    'Scrum Master',
    'Agile Coach',

    // === ANALYSIS ===
    'Business Analyst',
    'Systems Analyst',
    'Technical Analyst',

    // === BLOCKCHAIN & WEB3 ===
    'Blockchain Developer',
    'Smart Contract Developer',
    'Web3 Developer',
    'Solidity Developer',

    // === GAMING ===
    'Game Developer',
    'Unity Developer',
    'Unreal Engine Developer',
    'Game Designer',

    // === SPECIALTIES ===
    'Developer Advocate',
    'Technical Evangelist',
    'Solutions Engineer',
    'Sales Engineer',
    'Support Engineer',
    'Customer Success Engineer',
    'Embedded Systems Engineer',
    'IoT Engineer',
    'Firmware Engineer',
    'Network Engineer',

    // === CONSULTING ===
    'Technical Consultant',
    'Technology Consultant',
    'IT Consultant',
    'Digital Consultant',
];
