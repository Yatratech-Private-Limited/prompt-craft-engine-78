export type PositionRule = {
  position: string;
  words: string[];
};

export const POSITION_RULES_STORAGE_KEY = "prompt-maker.position-rules.v3";

export const DEFAULT_POSITION_RULES_TEXT = `Web Developer = website, websites, web, webpage, web app, landing page, wordpress, shopify, html, css, javascript
Frontend Developer = frontend, react, vue, angular, ui implementation, client side, responsive design
Backend Developer = backend, api, server, database, authentication, microservices, nodejs, java
Full Stack Developer = full stack, web platform, frontend, backend, end-to-end, web application
Mobile App Developer = mobile app, android, ios, iphone app, flutter, react native, apk
Software Engineer = software, system, platform, application, coding, programming, developer
AI Engineer = ai, artificial intelligence, llm, chatbot, agent, rag, prompt engineering
Machine Learning Engineer = machine learning, deep learning, tensorflow, pytorch, model training
Data Scientist = data science, prediction, analytics, statistics, machine learning, insights
Data Analyst = dashboard, reporting, sql, tableau, power bi, analytics
Data Engineer = etl, data pipeline, warehouse, spark, airflow, big data
DevOps Engineer = devops, ci/cd, docker, kubernetes, automation, deployment
Cloud Engineer = aws, azure, gcp, cloud infrastructure, terraform, cloud migration
Cybersecurity Analyst = security, infosec, penetration testing, vulnerability, soc, compliance
Network Engineer = network, router, switch, firewall, vpn, connectivity
System Administrator = sysadmin, server, linux, windows server, infrastructure, administration
Database Administrator = dba, database, mysql, postgres, backup, performance tuning
UI/UX Designer = design, ui, ux, figma, wireframe, prototype, user experience
Graphic Designer = logo, branding, poster, banner, flyer, visual design
Product Designer = product design, design system, interaction design, mockup, prototype
Motion Designer = motion graphics, animation, after effects, kinetic typography, video graphics
Video Editor = video editing, premiere pro, final cut, reels, youtube editing
3D Artist = blender, maya, 3d modeling, rendering, texturing, visualization
Animator = animation, character animation, storyboard, motion, cartoon
Game Developer = game, unity, unreal engine, gameplay, multiplayer, gaming
Game Designer = game design, level design, mechanics, balancing, narrative
Architectural Designer = architecture, building, blueprint, floor plan, revit, autocad
Interior Designer = interior, decor, furniture, room design, space planning, residential
Civil Engineer = construction, infrastructure, road, bridge, structural, site work
Structural Engineer = structural, load calculation, steel structure, concrete, building safety
Mechanical Engineer = mechanical, machinery, cad, solidworks, manufacturing, design
Electrical Engineer = electrical, circuit, electronics, power systems, wiring, control systems
Electronics Engineer = pcb, embedded, electronics, circuit design, microcontroller, hardware
Embedded Engineer = embedded systems, firmware, microcontroller, iot, hardware programming
Robotics Engineer = robotics, automation, sensors, control systems, robot programming
QA Engineer = testing, quality assurance, automation testing, selenium, bug tracking
Product Manager = roadmap, product strategy, feature planning, requirements, market research
Project Manager = project management, agile, scrum, planning, delivery, stakeholders
Business Analyst = requirements, process analysis, workflow, documentation, business process
Scrum Master = scrum, sprint planning, agile coaching, retrospective, facilitation
HR Manager = hr, recruitment, hiring, talent acquisition, employee relations
Recruiter = recruiter, sourcing, interviewing, candidate screening, hiring
Talent Acquisition Specialist = talent acquisition, recruitment, hiring pipeline, employer branding
Accountant = accounting, bookkeeping, tax, audit, ledger, finance
Financial Analyst = forecasting, valuation, budgeting, financial modeling, investment
Investment Analyst = stocks, equity research, portfolio analysis, valuation, investments
Marketing Manager = marketing, campaign, brand strategy, promotion, growth
Digital Marketing Specialist = seo, sem, ppc, google ads, social media marketing
SEO Specialist = seo, ranking, backlinks, keyword research, search optimization
Content Writer = content writing, blog, article, copywriting, website content
Copywriter = sales copy, ad copy, landing page copy, conversion copy, marketing content
Technical Writer = documentation, manuals, api docs, user guides, technical content
Social Media Manager = social media, instagram, facebook, linkedin, content calendar
Brand Manager = branding, brand identity, positioning, awareness, brand strategy
Sales Executive = sales, lead generation, prospecting, closing deals, crm
Business Development Manager = partnerships, growth, client acquisition, outreach, expansion
Customer Support Representative = customer service, support ticket, helpdesk, troubleshooting
Customer Success Manager = onboarding, retention, account growth, client success
Operations Manager = operations, workflow, process improvement, efficiency, logistics
Supply Chain Manager = procurement, inventory, logistics, sourcing, supply chain
Procurement Specialist = purchasing, vendor management, sourcing, procurement
Logistics Coordinator = shipping, transportation, freight, warehouse, logistics
Real Estate Agent = property, house sales, listings, buyer, seller, real estate
Property Manager = property management, leasing, tenants, facilities, rentals
Construction Manager = site management, contractors, building project, construction planning
Lawyer = attorney, legal advice, litigation, contracts, legal services
Legal Counsel = legal counsel, compliance, corporate law, contracts, regulations
Paralegal = legal assistant, case files, legal documentation, research
Compliance Officer = compliance, regulations, policy, audit, governance
Teacher = teaching, classroom, lesson plan, education, student learning
Professor = lecturer, academic, university, research, teaching
Research Scientist = laboratory, experiments, scientific research, publications
Agricultural Expert = agriculture, agricultural, farming, farm, crop, crops, farmers, agronomy, soil, irrigation, harvest, food system, food crisis, agricultural crisis
Doctor = physician, diagnosis, treatment, healthcare, medical practice
Nurse = nursing, patient care, clinic, healthcare, treatment
Pharmacist = pharmacy, medication, prescriptions, drug management
Dentist = dental, oral health, tooth care, dental clinic
Psychologist = psychology, counseling, therapy, mental health
Therapist = therapy, counseling, mental wellness, treatment, sessions
Social Worker = community support, welfare, case management, social services
Fitness Trainer = personal trainer, workout, fitness coaching, gym training
Nutritionist = diet plan, nutrition, meal planning, wellness, health coaching
Veterinarian = animal care, pet health, veterinary clinic, animal treatment
Chef = chef, cooking, restaurant kitchen, menu development, culinary
Hotel Manager = hotel operations, hospitality, guest services, accommodation
Event Manager = event planning, conference, wedding planning, event coordination
Virtual Assistant = administrative support, scheduling, email management, remote assistant
Executive Assistant = executive support, calendar management, travel coordination
Translator = translation, multilingual, language services, localization
Interpreter = interpretation, live translation, language support
E-commerce Manager = ecommerce, online store, shopify, amazon seller, product catalog
Amazon Specialist = amazon fba, seller central, amazon listing, marketplace
Shopify Developer = shopify, ecommerce website, online store development, liquid
WordPress Developer = wordpress, cms, plugin development, website customization
YouTube Manager = youtube growth, channel management, video strategy, monetization
Community Manager = community engagement, discord, forum management, audience growth`;

export function parsePositionRules(text: string): PositionRule[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.search(/[:=]/);
      if (separatorIndex === -1) return null;
      const position = line.slice(0, separatorIndex).trim();
      const words = line
        .slice(separatorIndex + 1)
        .split(",")
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean);
      if (!position || words.length === 0) return null;
      return { position, words };
    })
    .filter((rule): rule is PositionRule => Boolean(rule));
}
