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
    // === DESARROLLO DE SOFTWARE ===
    'Desarrollador de Software',
    'Desarrollador de Software Junior',
    'Desarrollador de Software Senior',
    'Ingeniero de Software',
    'Ingeniero de Software Junior',
    'Ingeniero de Software Senior',
    'Ingeniero de Software Staff',
    'Ingeniero de Software Principal',
    'Desarrollador Web',
    'Programador',

    // === FRONTEND ===
    'Desarrollador Frontend',
    'Desarrollador Frontend Junior',
    'Desarrollador Frontend Senior',
    'Ingeniero Frontend',
    'Especialista React',
    'Desarrollador React',
    'Especialista Vue.js',
    'Desarrollador Vue',
    'Especialista Angular',
    'Desarrollador Angular',
    'Desarrollador JavaScript',
    'Desarrollador TypeScript',

    // === BACKEND ===
    'Desarrollador Backend',
    'Desarrollador Backend Junior',
    'Desarrollador Backend Senior',
    'Ingeniero Backend',
    'Desarrollador Node.js',
    'Desarrollador Python',
    'Desarrollador Java',
    'Desarrollador .NET',
    'Desarrollador C#',
    'Desarrollador Go',
    'Desarrollador PHP',
    'Desarrollador Ruby',
    'Desarrollador Rust',

    // === FULL STACK ===
    'Desarrollador Full Stack',
    'Desarrollador Full Stack Junior',
    'Desarrollador Full Stack Senior',
    'Ingeniero Full Stack',

    // === MOBILE ===
    'Desarrollador Mobile',
    'Desarrollador iOS',
    'Desarrollador iOS Junior',
    'Desarrollador iOS Senior',
    'Desarrollador Swift',
    'Desarrollador Android',
    'Desarrollador Android Junior',
    'Desarrollador Android Senior',
    'Desarrollador Kotlin',
    'Desarrollador React Native',
    'Desarrollador Flutter',

    // === DEVOPS & CLOUD ===
    'Ingeniero DevOps',
    'Ingeniero DevOps Junior',
    'Ingeniero DevOps Senior',
    'SRE (Site Reliability Engineer)',
    'Ingeniero de Infraestructura',
    'Ingeniero Cloud',
    'Ingeniero AWS',
    'Ingeniero Azure',
    'Ingeniero Google Cloud',
    'Arquitecto Cloud',
    'Ingeniero de Plataforma',
    'Ingeniero Kubernetes',
    'Ingeniero Docker',

    // === QA & TESTING ===
    'QA Engineer',
    'QA Tester',
    'QA Automation Engineer',
    'Ingeniero de Pruebas',
    'SDET',
    'Test Engineer',
    'Analista QA',

    // === DATA ===
    'Data Scientist',
    'Data Scientist Junior',
    'Data Scientist Senior',
    'Científico de Datos',
    'Data Engineer',
    'Data Analyst',
    'Analista de Datos',
    'Ingeniero de Datos',
    'Arquitecto de Datos',
    'DBA (Administrador de Bases de Datos)',
    'Big Data Engineer',
    'ETL Developer',
    'Business Intelligence Analyst',
    'Analista BI',

    // === INTELIGENCIA ARTIFICIAL & MACHINE LEARNING ===
    'Ingeniero de Inteligencia Artificial',
    'Especialista en Inteligencia Artificial',
    'Machine Learning Engineer',
    'Ingeniero de Machine Learning',
    'ML Engineer',
    'ML Engineer Junior',
    'ML Engineer Senior',
    'AI Engineer',
    'Ingeniero de IA',
    'AI Researcher',
    'Investigador en IA',
    'Research Scientist',
    'Data Scientist ML',
    'Computer Vision Engineer',
    'Ingeniero de Visión por Computadora',
    'NLP Engineer',
    'Ingeniero de Procesamiento de Lenguaje Natural',
    'Deep Learning Engineer',
    'Ingeniero de Deep Learning',
    'MLOps Engineer',
    'Prompt Engineer',
    'LLM Engineer',
    'Ingeniero de LLM',
    'GenAI Engineer',
    'Ingeniero de IA Generativa',

    // === SEGURIDAD ===
    'Ingeniero de Seguridad',
    'Ingeniero de Ciberseguridad',
    'Cybersecurity Engineer',
    'Security Engineer',
    'Analista de Seguridad',
    'Pentester',
    'Ethical Hacker',
    'Hacker Ético',
    'Arquitecto de Seguridad',
    'SOC Analyst',
    'Security Analyst',

    // === ARQUITECTURA ===
    'Arquitecto de Software',
    'Arquitecto de Soluciones',
    'Solution Architect',
    'Arquitecto de Sistemas',
    'Technical Architect',
    'Enterprise Architect',

    // === LIDERAZGO TÉCNICO ===
    'Tech Lead',
    'Technical Lead',
    'Team Lead',
    'Lead Developer',
    'Engineering Manager',
    'Director de Ingeniería',
    'VP de Ingeniería',
    'CTO',
    'Head of Engineering',

    // === PRODUCTO ===
    'Product Manager',
    'Product Manager Junior',
    'Product Manager Senior',
    'Product Owner',
    'Group Product Manager',
    'Director de Producto',
    'VP de Producto',
    'CPO',
    'Technical Product Manager',
    'Associate Product Manager',

    // === DISEÑO ===
    'Product Designer',
    'Diseñador de Producto',
    'UX Designer',
    'Diseñador UX',
    'UI Designer',
    'Diseñador UI',
    'UX/UI Designer',
    'UX Researcher',
    'Investigador UX',
    'Design Lead',
    'Director de Diseño',

    // === GESTIÓN DE PROYECTOS ===
    'Project Manager',
    'Technical Project Manager',
    'Program Manager',
    'Scrum Master',
    'Agile Coach',
    'Product Owner',

    // === ANÁLISIS ===
    'Business Analyst',
    'Analista de Negocio',
    'Systems Analyst',
    'Analista de Sistemas',
    'Technical Analyst',

    // === BLOCKCHAIN & WEB3 ===
    'Blockchain Developer',
    'Desarrollador Blockchain',
    'Smart Contract Developer',
    'Web3 Developer',
    'Solidity Developer',

    // === VIDEOJUEGOS ===
    'Game Developer',
    'Desarrollador de Videojuegos',
    'Unity Developer',
    'Unreal Engine Developer',
    'Game Designer',
    'Diseñador de Juegos',

    // === ESPECIALIDADES ===
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
    'Ingeniero de Redes',

    // === CONSULTORÍA ===
    'Consultor Técnico',
    'Technology Consultant',
    'IT Consultant',
    'Consultor IT',
    'Digital Consultant',
];
