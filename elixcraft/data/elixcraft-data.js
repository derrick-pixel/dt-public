// ELIXCRAFT — Inline data globals (replaces fetch() for file:// compatibility)
// Source: SkillsFuture SG, MyCareersFuture, Hays SG, MOM, JobStreet — 2025

window.ELIXCRAFT_JOBS = {
  "meta": { "source": "SkillsFuture Singapore, MyCareersFuture, Hays SG, JobStreet SG — 2025", "updated": "2026-04-04" },
  "factions": {
    "protoss": {
      "label": "PROTOSS", "department": "Engineering & Technology", "color": "#ffd700",
      "lore": "Elite units powered by psionic technology. High cost, maximum impact.",
      "tracks": [
        { "id": "software", "name": "Software & Applications", "source": "SkillsFuture ICT Framework — Track 6",
          "roles": [
            { "id": "se1", "title": "Junior Software Engineer",   "level": [1,2],  "salary_sgd": [3550,5000],  "supply_cost": 1, "xp_to_next": 500  },
            { "id": "se2", "title": "Software Engineer",          "level": [3,4],  "salary_sgd": [5000,7000],  "supply_cost": 1, "xp_to_next": 1000 },
            { "id": "se3", "title": "Senior Software Engineer",   "level": [5,6],  "salary_sgd": [7000,9500],  "supply_cost": 1, "xp_to_next": 2000 },
            { "id": "se4", "title": "Staff Engineer",             "level": [7,8],  "salary_sgd": [9500,13000], "supply_cost": 2, "xp_to_next": 3500 },
            { "id": "se5", "title": "Principal Engineer",         "level": [9,10], "salary_sgd": [13000,18000],"supply_cost": 3, "xp_to_next": 5000 },
            { "id": "se6", "title": "Distinguished Engineer",     "level": [11,13],"salary_sgd": [18000,25000],"supply_cost": 4, "xp_to_next": null }
          ]
        },
        { "id": "data_ai", "name": "Data & Artificial Intelligence", "source": "SkillsFuture ICT Framework — Track 4",
          "roles": [
            { "id": "da1", "title": "Data Analyst",               "level": [1,3],  "salary_sgd": [3500,5500],  "supply_cost": 1, "xp_to_next": 600  },
            { "id": "da2", "title": "Data Scientist",             "level": [4,6],  "salary_sgd": [5500,9000],  "supply_cost": 1, "xp_to_next": 1800 },
            { "id": "da3", "title": "Senior Data Scientist",      "level": [7,8],  "salary_sgd": [9000,12000], "supply_cost": 2, "xp_to_next": 3000 },
            { "id": "da4", "title": "ML/AI Engineer",             "level": [5,7],  "salary_sgd": [8000,13000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "da5", "title": "Senior AI/ML Engineer",      "level": [8,10], "salary_sgd": [13000,18000],"supply_cost": 3, "xp_to_next": 4000 },
            { "id": "da6", "title": "Head of AI / Data Science",  "level": [11,13],"salary_sgd": [18000,28000],"supply_cost": 4, "xp_to_next": null }
          ]
        },
        { "id": "cybersec", "name": "Cyber Security", "source": "SkillsFuture ICT Framework — Track 1",
          "roles": [
            { "id": "cs1", "title": "Security Analyst",               "level": [2,4],  "salary_sgd": [4000,6500],  "supply_cost": 1, "xp_to_next": 800  },
            { "id": "cs2", "title": "Penetration Tester",             "level": [4,6],  "salary_sgd": [6000,9000],  "supply_cost": 1, "xp_to_next": 1500 },
            { "id": "cs3", "title": "Threat Intelligence Specialist", "level": [6,8],  "salary_sgd": [9000,13000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "cs4", "title": "Cloud Security Architect",       "level": [8,10], "salary_sgd": [13000,18000],"supply_cost": 3, "xp_to_next": 4000 },
            { "id": "cs5", "title": "CISO",                           "level": [12,14],"salary_sgd": [20000,35000],"supply_cost": 5, "xp_to_next": null }
          ]
        },
        { "id": "cloud_infra", "name": "Cloud & Infrastructure", "source": "SkillsFuture ICT Framework — Track 3",
          "roles": [
            { "id": "ci1", "title": "Cloud Engineer",              "level": [2,4],  "salary_sgd": [4500,7000],  "supply_cost": 1, "xp_to_next": 700  },
            { "id": "ci2", "title": "DevOps Engineer",             "level": [4,6],  "salary_sgd": [6500,9500],  "supply_cost": 1, "xp_to_next": 1500 },
            { "id": "ci3", "title": "Site Reliability Engineer",   "level": [6,8],  "salary_sgd": [9000,13000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "ci4", "title": "Cloud Solutions Architect",   "level": [8,10], "salary_sgd": [13000,20000],"supply_cost": 3, "xp_to_next": null }
          ]
        },
        { "id": "mgmt_eng", "name": "Engineering Management", "source": "SkillsFuture ICT Framework — Management Track",
          "roles": [
            { "id": "em1", "title": "Engineering Manager",         "level": [7,8],  "salary_sgd": [10000,14000],"supply_cost": 3, "xp_to_next": 3000 },
            { "id": "em2", "title": "Senior Engineering Manager",  "level": [9,10], "salary_sgd": [14000,18000],"supply_cost": 4, "xp_to_next": 4500 },
            { "id": "em3", "title": "Director of Engineering",     "level": [11,12],"salary_sgd": [18000,25000],"supply_cost": 5, "xp_to_next": 6000 },
            { "id": "em4", "title": "VP of Engineering",           "level": [13,14],"salary_sgd": [25000,40000],"supply_cost": 6, "xp_to_next": null }
          ]
        }
      ]
    },
    "terran": {
      "label": "TERRAN", "department": "Operations & Finance", "color": "#4a9eff",
      "lore": "Adaptable builders of empires. Masters of logistics, process, and finance.",
      "tracks": [
        { "id": "operations", "name": "Operations Management", "source": "SkillsFuture Engineering Services — Operations & Maintenance Track",
          "roles": [
            { "id": "op1", "title": "Operations Coordinator",      "level": [1,2],  "salary_sgd": [2800,4000],  "supply_cost": 1, "xp_to_next": 400  },
            { "id": "op2", "title": "Operations Analyst",          "level": [3,4],  "salary_sgd": [4000,5500],  "supply_cost": 1, "xp_to_next": 800  },
            { "id": "op3", "title": "Operations Manager",          "level": [5,7],  "salary_sgd": [5500,8500],  "supply_cost": 2, "xp_to_next": 2000 },
            { "id": "op4", "title": "Senior Operations Manager",   "level": [7,9],  "salary_sgd": [8500,12000], "supply_cost": 3, "xp_to_next": 3500 },
            { "id": "op5", "title": "Director of Operations",      "level": [10,12],"salary_sgd": [12000,20000],"supply_cost": 4, "xp_to_next": null }
          ]
        },
        { "id": "finance", "name": "Finance & Accounting", "source": "Hays SG Top 10 In-Demand Jobs 2025 + MyCareersFuture",
          "roles": [
            { "id": "fi1", "title": "Financial Analyst",           "level": [2,4],  "salary_sgd": [3500,6000],  "supply_cost": 1, "xp_to_next": 600  },
            { "id": "fi2", "title": "Finance Business Partner",    "level": [5,7],  "salary_sgd": [7000,11000], "supply_cost": 2, "xp_to_next": 2000 },
            { "id": "fi3", "title": "Corporate Finance Director",  "level": [9,11], "salary_sgd": [14000,22000],"supply_cost": 4, "xp_to_next": null },
            { "id": "fi4", "title": "Compliance Manager",          "level": [5,7],  "salary_sgd": [7000,11000], "supply_cost": 2, "xp_to_next": 2000 },
            { "id": "fi5", "title": "Wealth Manager",              "level": [5,8],  "salary_sgd": [7000,14000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "fi6", "title": "Head of Finance / CFO",       "level": [12,14],"salary_sgd": [20000,40000],"supply_cost": 5, "xp_to_next": null }
          ]
        },
        { "id": "procurement", "name": "Procurement & Supply Chain", "source": "Hays SG + SkillsFuture Engineering Services",
          "roles": [
            { "id": "pr1", "title": "Procurement Executive",       "level": [1,3],  "salary_sgd": [3000,4500],  "supply_cost": 1, "xp_to_next": 500  },
            { "id": "pr2", "title": "Procurement Manager",         "level": [4,6],  "salary_sgd": [5000,8000],  "supply_cost": 2, "xp_to_next": 1500 },
            { "id": "pr3", "title": "Head of Procurement",         "level": [8,10], "salary_sgd": [10000,16000],"supply_cost": 3, "xp_to_next": null }
          ]
        },
        { "id": "project_mgmt", "name": "Project Management", "source": "SkillsFuture Engineering Services — Project Development Track",
          "roles": [
            { "id": "pm1", "title": "Project Coordinator",         "level": [1,3],  "salary_sgd": [3000,4500],  "supply_cost": 1, "xp_to_next": 500  },
            { "id": "pm2", "title": "Project Manager",             "level": [4,6],  "salary_sgd": [5000,8000],  "supply_cost": 2, "xp_to_next": 1500 },
            { "id": "pm3", "title": "Senior Project Manager",      "level": [7,8],  "salary_sgd": [8000,12000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "pm4", "title": "Programme Director",          "level": [9,11], "salary_sgd": [12000,20000],"supply_cost": 4, "xp_to_next": null }
          ]
        }
      ]
    },
    "zerg": {
      "label": "ZERG", "department": "Sales, Marketing & People", "color": "#b44fff",
      "lore": "Relentless expansion. Dominate through velocity, growth, and swarm intelligence.",
      "tracks": [
        { "id": "sales", "name": "Sales & Business Development", "source": "Hays SG Top 10 In-Demand Jobs 2025 + JobStreet SG",
          "roles": [
            { "id": "sa1", "title": "Sales Development Rep (SDR)", "level": [1,2],  "salary_sgd": [2800,4500],  "supply_cost": 1, "xp_to_next": 400  },
            { "id": "sa2", "title": "Account Executive (AE)",      "level": [3,4],  "salary_sgd": [4500,7000],  "supply_cost": 1, "xp_to_next": 800  },
            { "id": "sa3", "title": "Senior Account Executive",    "level": [5,6],  "salary_sgd": [7000,10000], "supply_cost": 1, "xp_to_next": 1500 },
            { "id": "sa4", "title": "Business Development Manager","level": [6,8],  "salary_sgd": [8000,13000], "supply_cost": 2, "xp_to_next": 2500 },
            { "id": "sa5", "title": "VP of Sales",                 "level": [11,13],"salary_sgd": [18000,30000],"supply_cost": 5, "xp_to_next": null }
          ]
        },
        { "id": "marketing", "name": "Digital Marketing & Growth", "source": "Hays SG + JobStreet + Mavenside Consulting 2025",
          "roles": [
            { "id": "mk1", "title": "Digital Marketing Executive", "level": [1,3],  "salary_sgd": [3000,4500],  "supply_cost": 1, "xp_to_next": 500  },
            { "id": "mk2", "title": "Growth Marketing Manager",    "level": [4,6],  "salary_sgd": [5000,8000],  "supply_cost": 2, "xp_to_next": 1500 },
            { "id": "mk3", "title": "Digital Marketing Manager",   "level": [6,8],  "salary_sgd": [7000,11000], "supply_cost": 2, "xp_to_next": 2000 },
            { "id": "mk4", "title": "Head of Marketing / CMO",     "level": [10,12],"salary_sgd": [13000,25000],"supply_cost": 4, "xp_to_next": null }
          ]
        },
        { "id": "hr_people", "name": "Human Resources & People", "source": "SkillsFuture HR Framework + Robert Half SG Salary Guide 2025",
          "roles": [
            { "id": "hr1", "title": "HR Executive",                "level": [1,3],  "salary_sgd": [2800,4500],  "supply_cost": 1, "xp_to_next": 500  },
            { "id": "hr2", "title": "HR Generalist",               "level": [3,5],  "salary_sgd": [4000,6000],  "supply_cost": 1, "xp_to_next": 1000 },
            { "id": "hr3", "title": "HR Business Partner (HRBP)",  "level": [5,7],  "salary_sgd": [6000,10000], "supply_cost": 2, "xp_to_next": 2000 },
            { "id": "hr4", "title": "Senior HR Business Partner",  "level": [7,9],  "salary_sgd": [9000,14000], "supply_cost": 3, "xp_to_next": 3500 },
            { "id": "hr5", "title": "Head of People / CHRO",       "level": [11,13],"salary_sgd": [15000,30000],"supply_cost": 5, "xp_to_next": null }
          ]
        },
        { "id": "product", "name": "Product Management", "source": "MyCareersFuture + Mavenside Consulting 2025",
          "roles": [
            { "id": "pd1", "title": "Associate Product Manager",   "level": [2,3],  "salary_sgd": [4000,6000],  "supply_cost": 1, "xp_to_next": 700  },
            { "id": "pd2", "title": "Product Manager",             "level": [4,6],  "salary_sgd": [7000,11000], "supply_cost": 2, "xp_to_next": 1800 },
            { "id": "pd3", "title": "Senior Product Manager",      "level": [7,8],  "salary_sgd": [11000,15000],"supply_cost": 2, "xp_to_next": 3000 },
            { "id": "pd4", "title": "Director of Product / CPO",   "level": [10,12],"salary_sgd": [15000,25000],"supply_cost": 4, "xp_to_next": null }
          ]
        }
      ]
    }
  }
};

window.ELIXCRAFT_SKILLS = {
  "meta": { "source": "SkillsFuture ICT Framework, Mavenside Upskilling SG 2025, Hays SG, MyCareersFuture", "updated": "2026-04-04" },
  "categories": [
    { "id": "ai_ml", "name": "AI & Machine Learning", "icon": "🤖", "color": "#ffd700", "salary_premium_pct": 35,
      "source": "SkillsFuture ICT Framework Track 4 + GenAI Refresh March 2025",
      "skills": [
        { "id": "ai1", "name": "Prompt Engineering",           "tier": 1, "xp": 100, "prereqs": [],         "factions": ["protoss","zerg"],         "desc": "Design and optimise prompts for LLMs. GenAI skill added March 2025 by IMDA refresh." },
        { "id": "ai2", "name": "Machine Learning Fundamentals","tier": 1, "xp": 150, "prereqs": [],         "factions": ["protoss"],                "desc": "Supervised/unsupervised learning, model evaluation. TensorFlow, PyTorch basics." },
        { "id": "ai3", "name": "Natural Language Processing",  "tier": 2, "xp": 250, "prereqs": ["ai2"],    "factions": ["protoss"],                "desc": "Text classification, NER, sentiment analysis, transformer architectures." },
        { "id": "ai4", "name": "Computer Vision",              "tier": 2, "xp": 250, "prereqs": ["ai2"],    "factions": ["protoss"],                "desc": "CNNs, object detection, image segmentation with PyTorch / OpenCV." },
        { "id": "ai5", "name": "MLOps & Model Deployment",     "tier": 3, "xp": 350, "prereqs": ["ai2"],    "factions": ["protoss"],                "desc": "Model versioning, CI/CD for ML, monitoring in production." },
        { "id": "ai6", "name": "AI Ethics & Governance",       "tier": 2, "xp": 200, "prereqs": ["ai1"],    "factions": ["protoss","terran","zerg"], "desc": "Responsible AI implementation. Required by MAS and PDPA guidelines." },
        { "id": "ai7", "name": "GenAI Application Development","tier": 3, "xp": 400, "prereqs": ["ai1","ai3"],"factions": ["protoss","zerg"],        "desc": "Build apps on top of LLM APIs. RAG pipelines, agent frameworks." }
      ]
    },
    { "id": "cybersec", "name": "Cybersecurity", "icon": "🛡️", "color": "#ef5350", "salary_premium_pct": 40,
      "source": "SkillsFuture ICT Framework Track 1",
      "skills": [
        { "id": "cy0", "name": "Security Fundamentals (CEH)",  "tier": 1, "xp": 150, "prereqs": [],         "factions": ["protoss","terran"],       "desc": "Core security concepts, CIA triad, OWASP Top 10." },
        { "id": "cy1", "name": "Threat Intelligence",          "tier": 2, "xp": 250, "prereqs": ["cy0"],    "factions": ["protoss"],                "desc": "IOC analysis, MITRE ATT&CK framework, threat hunting." },
        { "id": "cy2", "name": "Penetration Testing",          "tier": 2, "xp": 300, "prereqs": ["cy0"],    "factions": ["protoss"],                "desc": "Web/network pen testing with Burp Suite, Metasploit, Nmap." },
        { "id": "cy3", "name": "Cloud Security (CCSP)",        "tier": 3, "xp": 400, "prereqs": ["cy0"],    "factions": ["protoss"],                "desc": "Zero-trust architecture, cloud SIEM, container security." },
        { "id": "cy4", "name": "PDPA & MAS Compliance",        "tier": 2, "xp": 200, "prereqs": [],         "factions": ["protoss","terran"],       "desc": "Singapore Personal Data Protection Act, MAS TRM Guidelines." },
        { "id": "cy5", "name": "Incident Response",            "tier": 3, "xp": 350, "prereqs": ["cy1"],    "factions": ["protoss"],                "desc": "IR playbooks, forensics, SIEM tools (Splunk, QRadar)." }
      ]
    },
    { "id": "data", "name": "Data Analytics", "icon": "📊", "color": "#4a9eff", "salary_premium_pct": 20,
      "source": "SkillsFuture ICT Framework Track 4 + Mavenside 2025",
      "skills": [
        { "id": "dt1", "name": "SQL & Database Management",    "tier": 1, "xp": 120, "prereqs": [],         "factions": ["protoss","terran"],       "desc": "Complex queries, stored procedures, optimisation across RDBMS." },
        { "id": "dt2", "name": "Python for Data Science",      "tier": 1, "xp": 150, "prereqs": [],         "factions": ["protoss"],                "desc": "Pandas, NumPy, SciPy, Jupyter notebooks." },
        { "id": "dt3", "name": "Data Visualisation",           "tier": 2, "xp": 200, "prereqs": ["dt1"],    "factions": ["protoss","terran","zerg"], "desc": "Tableau, Power BI, Qlik. Storytelling with data." },
        { "id": "dt4", "name": "Statistical Analysis",         "tier": 2, "xp": 220, "prereqs": ["dt2"],    "factions": ["protoss"],                "desc": "Regression, hypothesis testing, A/B testing design." },
        { "id": "dt5", "name": "Business Intelligence",        "tier": 2, "xp": 200, "prereqs": ["dt1"],    "factions": ["terran","zerg"],          "desc": "Dashboard strategy, KPI definition, self-serve analytics." },
        { "id": "dt6", "name": "Big Data & Spark",             "tier": 3, "xp": 350, "prereqs": ["dt2"],    "factions": ["protoss"],                "desc": "Hadoop ecosystem, Spark, Kafka, data lake architecture." }
      ]
    },
    { "id": "cloud", "name": "Cloud & DevOps", "icon": "☁️", "color": "#00e676", "salary_premium_pct": 25,
      "source": "SkillsFuture ICT Framework Track 3 + Mavenside 2025",
      "skills": [
        { "id": "cl1", "name": "AWS Certified Solutions Architect","tier": 2, "xp": 300, "prereqs": [],      "factions": ["protoss"],                "desc": "Core AWS services, high-availability architecture, IAM." },
        { "id": "cl2", "name": "Azure / GCP Fundamentals",      "tier": 1, "xp": 150, "prereqs": [],         "factions": ["protoss","terran"],       "desc": "Cloud concepts, compute, storage, networking on Azure or GCP." },
        { "id": "cl3", "name": "Kubernetes & Docker",           "tier": 2, "xp": 250, "prereqs": ["cl2"],    "factions": ["protoss"],                "desc": "Container orchestration, Helm, service mesh." },
        { "id": "cl4", "name": "Infrastructure as Code (IaC)",  "tier": 3, "xp": 350, "prereqs": ["cl3"],    "factions": ["protoss"],                "desc": "Terraform, CloudFormation, Pulumi for repeatable infra." },
        { "id": "cl5", "name": "CI/CD Pipelines",               "tier": 2, "xp": 220, "prereqs": ["cl2"],    "factions": ["protoss"],                "desc": "GitHub Actions, Jenkins, GitLab CI, deployment strategies." }
      ]
    },
    { "id": "software", "name": "Software Engineering", "icon": "💻", "color": "#ffd700", "salary_premium_pct": 15,
      "source": "SkillsFuture ICT Framework Track 6 + JobStreet SG",
      "skills": [
        { "id": "sw1", "name": "Full-Stack Development",        "tier": 2, "xp": 280, "prereqs": [],         "factions": ["protoss"],                "desc": "React/Next.js frontend + Node.js/Python backend, REST & GraphQL APIs." },
        { "id": "sw2", "name": "System Design",                 "tier": 3, "xp": 400, "prereqs": ["sw1"],    "factions": ["protoss"],                "desc": "Distributed systems, CAP theorem, design interviews." },
        { "id": "sw3", "name": "Java / Spring Boot",            "tier": 2, "xp": 250, "prereqs": [],         "factions": ["protoss"],                "desc": "Enterprise Java, microservices, Spring ecosystem." },
        { "id": "sw4", "name": "Python Programming",            "tier": 1, "xp": 150, "prereqs": [],         "factions": ["protoss","zerg"],         "desc": "Scripting, automation, Django/FastAPI web frameworks." },
        { "id": "sw5", "name": "Mobile Development (iOS/Android)","tier":2, "xp": 300, "prereqs": [],        "factions": ["protoss","zerg"],         "desc": "Swift, Kotlin, React Native, Flutter." },
        { "id": "sw6", "name": "Agile & Scrum (CSM)",           "tier": 1, "xp": 120, "prereqs": [],         "factions": ["protoss","terran","zerg"], "desc": "Sprint planning, backlog grooming, Jira, velocity tracking." }
      ]
    },
    { "id": "finance_skills", "name": "Finance & Compliance", "icon": "💰", "color": "#4a9eff", "salary_premium_pct": 18,
      "source": "Hays SG Top 10 In-Demand Jobs 2025",
      "skills": [
        { "id": "fn1", "name": "Financial Modelling",           "tier": 2, "xp": 250, "prereqs": [],         "factions": ["terran"],                "desc": "DCF, LBO, M&A models. Excel, Python for finance." },
        { "id": "fn2", "name": "Risk Management",               "tier": 2, "xp": 220, "prereqs": [],         "factions": ["terran"],                "desc": "Market, credit, operational risk frameworks. Basel III/IV." },
        { "id": "fn3", "name": "MAS Regulatory Compliance",     "tier": 2, "xp": 200, "prereqs": [],         "factions": ["terran"],                "desc": "MAS 626, SGX listing rules, AML/CFT frameworks." },
        { "id": "fn4", "name": "ESG & Sustainable Finance",     "tier": 2, "xp": 250, "prereqs": [],         "factions": ["terran","zerg"],          "desc": "Carbon accounting, green bonds, TCFD reporting, Singapore Green Plan 2030." },
        { "id": "fn5", "name": "FinTech & Blockchain",          "tier": 3, "xp": 350, "prereqs": [],         "factions": ["terran","protoss"],       "desc": "DeFi, payment rails, RegTech, MAS sandbox." },
        { "id": "fn6", "name": "FP&A (Financial Planning)",     "tier": 2, "xp": 200, "prereqs": ["fn1"],    "factions": ["terran"],                "desc": "Budgeting, forecasting, variance analysis, management reporting." }
      ]
    },
    { "id": "ops_skills", "name": "Operations & Project Mgmt", "icon": "⚙️", "color": "#4a9eff", "salary_premium_pct": 12,
      "source": "SkillsFuture Engineering Services Framework",
      "skills": [
        { "id": "op1", "name": "PMP / CAPM Certification",      "tier": 2, "xp": 250, "prereqs": [],         "factions": ["terran"],                "desc": "PMI project management methodology, risk, scope, schedule." },
        { "id": "op2", "name": "Process Improvement (Lean/Six Sigma)","tier":2,"xp":220,"prereqs":[],        "factions": ["terran"],                "desc": "Kaizen, DMAIC, VSM. Green Belt / Black Belt pathway." },
        { "id": "op3", "name": "Supply Chain Management",       "tier": 2, "xp": 200, "prereqs": [],         "factions": ["terran"],                "desc": "Demand forecasting, vendor management, SCOR framework." },
        { "id": "op4", "name": "Business Analysis (CBAP)",      "tier": 2, "xp": 220, "prereqs": [],         "factions": ["terran","zerg"],          "desc": "Requirements elicitation, process mapping, stakeholder analysis." },
        { "id": "op5", "name": "Automation & RPA",              "tier": 3, "xp": 300, "prereqs": ["op2"],    "factions": ["terran","protoss"],       "desc": "UiPath, Power Automate. Robotics Process Automation for operations." }
      ]
    },
    { "id": "marketing_skills", "name": "Marketing & Growth", "icon": "📣", "color": "#b44fff", "salary_premium_pct": 15,
      "source": "Hays SG + Mavenside Consulting 2025",
      "skills": [
        { "id": "mkt1","name": "SEO & SEM",                     "tier": 1, "xp": 120, "prereqs": [],         "factions": ["zerg"],                  "desc": "Organic search optimisation, Google Ads, keyword strategy." },
        { "id": "mkt2","name": "Social Media Marketing",        "tier": 1, "xp": 100, "prereqs": [],         "factions": ["zerg"],                  "desc": "LinkedIn, Instagram, TikTok strategy, influencer partnerships." },
        { "id": "mkt3","name": "Marketing Automation & CRM",    "tier": 2, "xp": 200, "prereqs": ["mkt2"],   "factions": ["zerg"],                  "desc": "HubSpot, Salesforce, Marketo. Lead nurturing workflows." },
        { "id": "mkt4","name": "Content Strategy",              "tier": 2, "xp": 180, "prereqs": [],         "factions": ["zerg"],                  "desc": "Audience research, content calendars, copywriting, brand voice." },
        { "id": "mkt5","name": "Performance Marketing",         "tier": 2, "xp": 220, "prereqs": ["mkt1"],   "factions": ["zerg"],                  "desc": "ROAS optimisation, multi-channel attribution, conversion funnels." },
        { "id": "mkt6","name": "E-Commerce & Digital Commerce", "tier": 2, "xp": 200, "prereqs": [],         "factions": ["zerg"],                  "desc": "Shopify, Lazada, Shopee. Cross-border e-commerce, SEA markets." }
      ]
    },
    { "id": "hr_skills", "name": "People & HR", "icon": "🤝", "color": "#b44fff", "salary_premium_pct": 10,
      "source": "SkillsFuture HR Framework + Robert Half SG 2025",
      "skills": [
        { "id": "hr1", "name": "Talent Acquisition",            "tier": 1, "xp": 120, "prereqs": [],         "factions": ["zerg","terran"],          "desc": "Sourcing, interviewing, employer branding, ATS management." },
        { "id": "hr2", "name": "Compensation & Benefits",       "tier": 2, "xp": 200, "prereqs": [],         "factions": ["zerg","terran"],          "desc": "Salary benchmarking, total rewards design, CPF compliance." },
        { "id": "hr3", "name": "Learning & Development (L&D)",  "tier": 2, "xp": 200, "prereqs": [],         "factions": ["zerg","terran"],          "desc": "Training needs analysis, LMS administration, SkillsFuture alignment." },
        { "id": "hr4", "name": "HRIS & People Analytics",       "tier": 2, "xp": 220, "prereqs": ["hr1"],    "factions": ["zerg","terran"],          "desc": "Workday, SAP SuccessFactors, workforce analytics dashboards." },
        { "id": "hr5", "name": "Employment Law (MOM)",          "tier": 2, "xp": 180, "prereqs": [],         "factions": ["zerg","terran"],          "desc": "Employment Act, TAFEP guidelines, IR/ER management." },
        { "id": "hr6", "name": "Organisational Development",    "tier": 3, "xp": 300, "prereqs": ["hr3"],    "factions": ["zerg","terran"],          "desc": "Change management, culture design, OKR frameworks." }
      ]
    },
    { "id": "leadership", "name": "Leadership & Soft Skills", "icon": "👑", "color": "#ffd700", "salary_premium_pct": 8,
      "source": "SkillsFuture Critical Core Skills Framework",
      "skills": [
        { "id": "ls1", "name": "Stakeholder Management",        "tier": 2, "xp": 180, "prereqs": [],         "factions": ["protoss","terran","zerg"], "desc": "Executive communication, managing up, cross-functional alignment." },
        { "id": "ls2", "name": "Strategic Thinking",            "tier": 3, "xp": 300, "prereqs": ["ls1"],    "factions": ["protoss","terran","zerg"], "desc": "Long-range planning, scenario analysis, OKR design." },
        { "id": "ls3", "name": "Team Leadership",               "tier": 2, "xp": 200, "prereqs": [],         "factions": ["protoss","terran","zerg"], "desc": "Coaching, performance management, delegation, psychological safety." },
        { "id": "ls4", "name": "Communication & Presentation",  "tier": 1, "xp": 120, "prereqs": [],         "factions": ["protoss","terran","zerg"], "desc": "Executive storytelling, data presentations, difficult conversations." },
        { "id": "ls5", "name": "Change Management",             "tier": 3, "xp": 280, "prereqs": ["ls3"],    "factions": ["terran","zerg"],          "desc": "ADKAR, Kotter's 8-step, managing organisational transformation." },
        { "id": "ls6", "name": "Cultural Competency",           "tier": 1, "xp": 100, "prereqs": [],         "factions": ["protoss","terran","zerg"], "desc": "Working across ASEAN, Singapore multicultural workplace norms." }
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// ELIXCRAFT INDUSTRIES — 16 Sectors · Elitez Group Industry Expertise
// Source: Hays SG 2025, MyCareersFuture, SkillsFuture, MOM Singapore
// ═══════════════════════════════════════════════════════════════════════
window.ELIXCRAFT_INDUSTRIES = {
  meta: { source: "Elitez Group Industry Expertise + Hays SG 2025 + MyCareersFuture + SkillsFuture", updated: "2026-04-04" },
  quadrants: [
    { id: "alpha", label: "ALPHA QUADRANT", subtitle: "People & Consumer",    color: "#ff7043" },
    { id: "beta",  label: "BETA QUADRANT",  subtitle: "Industrial & Physical", color: "#607d8b" },
    { id: "gamma", label: "GAMMA QUADRANT", subtitle: "Tech & Finance",        color: "#29b6f6" },
    { id: "delta", label: "DELTA QUADRANT", subtitle: "Specialized & Public",  color: "#ab47bc" },
  ],
  sectors: [

    // ── ALPHA: People & Consumer ──────────────────────────────────────────
    {
      id: "fmcg", name: "FMCG", fullName: "Fast-Moving Consumer Goods",
      icon: "🛒", quadrant: "alpha", color: "#ff7043",
      faction: "zerg", factionBonus: "ZERG +20% ADAPTABILITY — High-velocity consumer campaigns across SEA",
      description: "Trade shows, brand activations, and promotional campaigns. SG serves as the regional HQ for major FMCG brands entering SEA.",
      status: "available", openRoles: 12,
      roles: [
        { title: "Brand Activations Executive",  level: [1,3],   salary: [2800, 4500]  },
        { title: "Trade Marketing Executive",    level: [3,5],   salary: [4000, 6500]  },
        { title: "Brand Manager",                level: [5,7],   salary: [6500, 10000] },
        { title: "Regional Marketing Director",  level: [8,11],  salary: [11000, 18000]},
      ],
      skills: ["Brand Management", "Campaign Analytics", "Retail Execution", "Consumer Insights", "Digital Marketing"],
    },
    {
      id: "retail", name: "Retail", fullName: "Retail & Merchandising",
      icon: "🏪", quadrant: "alpha", color: "#ff8a65",
      faction: "zerg", factionBonus: "ZERG +15% GROWTH SPEED — Volume-driven, people-intensive expansion",
      description: "Store Managers, sales associates, merchandisers, retail buyers and inventory specialists. Strong presence across Orchard, Jurong, and heartland malls.",
      status: "available", openRoles: 18,
      roles: [
        { title: "Sales Associate",       level: [1,2],  salary: [2200, 3500]  },
        { title: "Store Manager",         level: [3,5],  salary: [3500, 6000]  },
        { title: "Retail Buyer",          level: [4,6],  salary: [4500, 7500]  },
        { title: "Merchandising Manager", level: [4,6],  salary: [4000, 6500]  },
        { title: "Regional Retail Head",  level: [8,10], salary: [9000, 15000] },
      ],
      skills: ["Inventory Management", "Visual Merchandising", "Customer Experience", "POS Systems", "Category Management"],
    },
    {
      id: "mice", name: "MICE", fullName: "Meetings, Incentives, Conferences & Events",
      icon: "🎪", quadrant: "alpha", color: "#ffa726",
      faction: "zerg", factionBonus: "ZERG +25% CHA — High-energy event execution and stakeholder relations",
      description: "Event managers, coordinators, exhibition sales, operations managers and event marketing specialists. Singapore is Asia's #1 MICE hub.",
      status: "available", openRoles: 9,
      roles: [
        { title: "Event Coordinator",         level: [1,3],  salary: [2500, 4000]  },
        { title: "Event Manager",             level: [3,6],  salary: [4000, 7000]  },
        { title: "Exhibition Sales Manager",  level: [4,7],  salary: [5000, 9000]  },
        { title: "Event Operations Manager",  level: [5,7],  salary: [6000, 9500]  },
        { title: "Director of Events",        level: [8,11], salary: [10000, 16000]},
      ],
      skills: ["Event Planning", "Vendor Management", "Stakeholder Relations", "Budget Control", "Exhibition Sales"],
    },
    {
      id: "fnb", name: "F&B, Hospitality", fullName: "Food & Beverage / Hospitality",
      icon: "🍽️", quadrant: "alpha", color: "#ff7043",
      faction: "multi", factionBonus: "ALL FACTIONS — Essential services across every domain of the empire",
      description: "Front desk management, guest services, chefs and administrative support. Tourism-resilient sector with strong growth post-2024.",
      status: "available", openRoles: 24,
      roles: [
        { title: "F&B Service Staff",         level: [1,2],  salary: [2000, 3200]  },
        { title: "Guest Relations Officer",   level: [2,4],  salary: [2800, 4500]  },
        { title: "F&B Manager",               level: [4,7],  salary: [4500, 8000]  },
        { title: "Executive Chef",            level: [6,9],  salary: [6000, 11000] },
        { title: "Hotel General Manager",     level: [9,12], salary: [12000, 22000]},
      ],
      skills: ["Hospitality Standards", "Food Safety (FSSC 22000)", "Revenue Management", "Guest Experience Design", "Team Operations"],
    },

    // ── BETA: Industrial & Physical ───────────────────────────────────────
    {
      id: "manufacturing", name: "Manufacturing", fullName: "Manufacturing & Production",
      icon: "🏭", quadrant: "beta", color: "#607d8b",
      faction: "terran", factionBonus: "TERRAN +20% STR — Process mastery and operational precision",
      description: "Production Managers, Quality Assurance, Technicians, Supply Chain and Process Engineers. SG's advanced manufacturing includes semiconductors, pharma, and precision engineering.",
      status: "available", openRoles: 15,
      roles: [
        { title: "Production Technician",      level: [1,3],  salary: [2500, 4000]  },
        { title: "Quality Assurance Engineer", level: [3,5],  salary: [4000, 6500]  },
        { title: "Process Engineer",           level: [4,7],  salary: [5000, 8500]  },
        { title: "Production Manager",         level: [5,8],  salary: [6000, 10000] },
        { title: "Plant / Factory Director",   level: [9,12], salary: [12000, 20000]},
      ],
      skills: ["Lean Manufacturing", "Six Sigma (DMAIC)", "ISO 9001 / ISO 13485", "Statistical Process Control", "ERP (SAP/Oracle)"],
    },
    {
      id: "construction", name: "Construction", fullName: "Construction & Built Environment",
      icon: "🏗️", quadrant: "beta", color: "#78909c",
      faction: "terran", factionBonus: "TERRAN +15% DEX — Structural precision and project delivery at scale",
      description: "Civil engineers, structural engineers, project managers, quantity surveyors and mechanical engineers. BCA Green Mark standards apply across all major projects.",
      status: "available", openRoles: 11,
      roles: [
        { title: "Quantity Surveyor",                    level: [2,4],  salary: [3500, 6000]  },
        { title: "Civil / Structural Engineer",          level: [3,5],  salary: [4500, 7500]  },
        { title: "Mechanical & Electrical Engineer",     level: [4,6],  salary: [5000, 8500]  },
        { title: "Project Manager (Construction)",       level: [6,9],  salary: [8000, 14000] },
        { title: "Construction / Development Director",  level: [10,13],salary: [15000, 25000]},
      ],
      skills: ["AutoCAD / Revit / BIM", "Project Management (PMP)", "Contract Administration (FIDIC)", "Cost Planning", "Workplace Safety (WSH Act)"],
    },
    {
      id: "logistics", name: "Logistics", fullName: "Logistics & Supply Chain",
      icon: "🚚", quadrant: "beta", color: "#546e7a",
      faction: "terran", factionBonus: "TERRAN +25% ADAPTABILITY — Masters of movement, flow, and inventory",
      description: "Supply Chain managers, Warehouse Supervisors, Logistics Coordinators, Inventory Control and Transporters. Singapore's port is world's 2nd busiest — logistics is critical infrastructure.",
      status: "available", openRoles: 20,
      roles: [
        { title: "Logistics Coordinator",      level: [1,3],  salary: [2800, 4500]  },
        { title: "Warehouse Supervisor",       level: [2,4],  salary: [3200, 5000]  },
        { title: "Inventory Control Analyst",  level: [3,5],  salary: [3500, 5500]  },
        { title: "Supply Chain Manager",       level: [5,8],  salary: [6500, 11000] },
        { title: "Head of Supply Chain",       level: [9,12], salary: [13000, 22000]},
      ],
      skills: ["Warehouse Management Systems (WMS)", "SAP / Oracle TMS", "Last-Mile & Cold Chain", "Import/Export Compliance", "Demand Forecasting"],
    },
    {
      id: "automotives", name: "Automotives", fullName: "Automotive Engineering & Services",
      icon: "🚗", quadrant: "beta", color: "#455a64",
      faction: "terran", factionBonus: "TERRAN +10% TECH DEPTH — Mechanical precision and diagnostic expertise",
      description: "Automotive engineers, vehicle technicians, inspectors, designers and service managers. EV adoption is accelerating under Singapore's 2030 EV roadmap.",
      status: "available", openRoles: 7,
      roles: [
        { title: "Vehicle Technician",       level: [1,3],  salary: [2500, 4000]  },
        { title: "Automotive Inspector",     level: [2,4],  salary: [3000, 5000]  },
        { title: "Automotive Engineer",      level: [4,7],  salary: [5000, 9000]  },
        { title: "EV Systems Engineer",      level: [5,8],  salary: [6500, 11000] },
        { title: "Service / Workshop Manager",level: [4,7], salary: [5000, 8500]  },
      ],
      skills: ["Vehicle Diagnostics (OBD)", "EV & Hybrid Systems", "AutoCAD / CAD-CAM", "LTA Regulatory Compliance", "Telematics & Fleet Management"],
    },

    // ── GAMMA: Tech & Finance ──────────────────────────────────────────────
    {
      id: "it", name: "IT", fullName: "Information Technology",
      icon: "💻", quadrant: "gamma", color: "#29b6f6",
      faction: "protoss", factionBonus: "PROTOSS +30% TECH DEPTH — Psionic-powered systems mastery · HOME SECTOR BONUS",
      description: "Software developers, network administrators, cybersecurity analysts and IT support specialists. SG is SEA's tech hub — IMDA, MAS Fintech, Smart Nation all driving demand.",
      status: "deployed", openRoles: 32,
      roles: [
        { title: "IT Support Specialist",     level: [1,3],  salary: [2800, 4500]  },
        { title: "Network Administrator",     level: [3,5],  salary: [4500, 7000]  },
        { title: "Software Developer",        level: [3,6],  salary: [4500, 9000]  },
        { title: "Cybersecurity Analyst",     level: [5,8],  salary: [7000, 13000] },
        { title: "IT Director / CTO",         level: [10,13],salary: [18000, 35000]},
      ],
      skills: ["Cloud Computing (AWS/Azure/GCP)", "Cybersecurity & SOC", "Software Engineering", "Network Architecture", "AI/ML & GenAI"],
    },
    {
      id: "banking", name: "Banking & Finance", fullName: "Banking, Finance & Fintech",
      icon: "🏦", quadrant: "gamma", color: "#039be5",
      faction: "protoss", factionBonus: "PROTOSS +20% INT — Strategic analytical precision in regulated markets",
      description: "Fintech innovators, investment bankers, corporate banking, insurance and asset management specialists. MAS's digital banking licences drive new PROTOSS demand.",
      status: "available", openRoles: 14,
      roles: [
        { title: "Financial / Risk Analyst",       level: [2,4],  salary: [4000, 7000]  },
        { title: "Investment Associate",           level: [4,7],  salary: [7000, 14000] },
        { title: "Fintech Product Manager",        level: [5,8],  salary: [8000, 14000] },
        { title: "Corporate Banking Manager",      level: [6,9],  salary: [9000, 16000] },
        { title: "Managing Director (Banking)",    level: [11,14],salary: [20000, 45000]},
      ],
      skills: ["Financial Modelling (DCF/LBO)", "Bloomberg / Reuters", "MAS Regulatory Compliance", "Risk Management (Basel IV)", "Fintech & Blockchain (MAS Sandbox)"],
    },
    {
      id: "green_energy", name: "Green Energy", fullName: "Renewable Energy & Clean Tech",
      icon: "⚡", quadrant: "gamma", color: "#66bb6a",
      faction: "protoss", factionBonus: "PROTOSS +25% INT — Innovation-driven clean tech mastery under SG Green Plan 2030",
      description: "Renewable energy engineers, analysts, technicians and project managers. Singapore's $35B green investment push to 2030 makes this a high-growth frontier sector.",
      status: "available", openRoles: 8,
      roles: [
        { title: "Energy Technician",             level: [1,3],  salary: [3000, 5000]  },
        { title: "Renewable Energy Analyst",      level: [3,5],  salary: [5000, 8000]  },
        { title: "Solar / Wind Project Engineer", level: [4,7],  salary: [6000, 11000] },
        { title: "Energy Project Manager",        level: [6,9],  salary: [9000, 15000] },
        { title: "Head of Clean Energy",          level: [9,12], salary: [14000, 24000]},
      ],
      skills: ["Renewable Systems Design", "Energy Modelling (PVSyst)", "Grid Integration & Storage", "Project Finance (Green Bonds)", "Carbon Credits & Markets"],
    },
    {
      id: "aviation", name: "Aviation", fullName: "Aviation & Aerospace (2025)",
      icon: "✈️", quadrant: "gamma", color: "#0288d1",
      faction: "protoss", factionBonus: "PROTOSS +30% PRECISION — Elite zero-fault-tolerance systems, MRO hub expansion",
      description: "Aircraft maintenance engineers, air traffic controllers, flight operations officers, aviation safety inspectors and airport services. Changi's T5 expansion drives significant new demand.",
      status: "available", openRoles: 10,
      roles: [
        { title: "Airport Operations Staff",         level: [1,3],  salary: [2800, 4500]  },
        { title: "Aircraft Maintenance Engineer",    level: [3,6],  salary: [5000, 10000] },
        { title: "Flight Operations Officer",        level: [5,8],  salary: [7000, 13000] },
        { title: "Air Traffic Controller",           level: [5,8],  salary: [8000, 16000] },
        { title: "Aviation Safety Inspector",        level: [7,10], salary: [10000, 18000]},
      ],
      skills: ["CAAS Certification", "Aviation SMS & Safety", "Aircraft Systems (B1/B2)", "Navigation & Communications", "Airport Emergency Response"],
    },

    // ── DELTA: Specialized & Public ───────────────────────────────────────
    {
      id: "government", name: "Government Services", fullName: "Government & Public Services",
      icon: "🏛️", quadrant: "delta", color: "#ab47bc",
      faction: "terran", factionBonus: "TERRAN +20% STABILITY — Process-driven public administration and policy execution",
      description: "Civil service administrators, planners and compliance officers across Singapore's 16 ministries and statutory boards. Stable, structured career tracks with SGD-benchmarked compensation.",
      status: "available", openRoles: 6,
      roles: [
        { title: "Administrative / Executive Officer", level: [1,3],  salary: [3000, 5000]  },
        { title: "Compliance Officer",                 level: [3,6],  salary: [5000, 9000]  },
        { title: "Policy Analyst",                     level: [4,7],  salary: [6000, 11000] },
        { title: "Urban / Regional Planner",           level: [5,8],  salary: [7000, 12000] },
        { title: "Director of Public Service",         level: [10,13],salary: [15000, 28000]},
      ],
      skills: ["Public Administration", "Policy Analysis & Drafting", "Stakeholder Engagement (WOG)", "Public Sector Data Analytics", "Regulatory Compliance"],
    },
    {
      id: "healthcare", name: "Healthcare", fullName: "Healthcare & Life Sciences",
      icon: "🏥", quadrant: "delta", color: "#ec407a",
      faction: "protoss", factionBonus: "PROTOSS +25% PRECISION — High-skill, low-error critical care roles",
      description: "Medical doctors, registered nurses, laboratory technicians, pharmacists and healthcare administrators. SG's Healthtech 2030 roadmap and aging population drive sustained demand.",
      status: "available", openRoles: 22,
      roles: [
        { title: "Healthcare Administrator",    level: [1,3],  salary: [2800, 4500]  },
        { title: "Laboratory Technician",       level: [2,4],  salary: [3200, 5500]  },
        { title: "Registered Nurse (SRN)",      level: [3,6],  salary: [3500, 7000]  },
        { title: "Pharmacist",                  level: [4,7],  salary: [5000, 9500]  },
        { title: "Medical Specialist / Doctor", level: [7,12], salary: [12000, 35000]},
      ],
      skills: ["Clinical Protocols & Patient Care", "Healthcare IT (HIS/EMR)", "MOH Licensing & Accreditation", "Medical Device Operation", "Infection Control"],
    },
    {
      id: "security", name: "Security Services", fullName: "Physical & Cyber Security",
      icon: "🛡️", quadrant: "delta", color: "#ef5350",
      faction: "multi", factionBonus: "PROTOSS +cyber · TERRAN +physical — Dual-domain threat response capability",
      description: "Security officers, cybersecurity analysts and surveillance technicians across physical and digital perimeters. MHA licensing and CSA certification are sector requirements.",
      status: "available", openRoles: 16,
      roles: [
        { title: "Security Officer (MHA Licensed)", level: [1,3],  salary: [2500, 4000]  },
        { title: "Surveillance Technician",         level: [2,4],  salary: [3000, 5000]  },
        { title: "Cybersecurity Analyst (SOC)",     level: [4,7],  salary: [6500, 12000] },
        { title: "Security Operations Manager",     level: [5,8],  salary: [7000, 12000] },
        { title: "Chief Security Officer (CSO)",    level: [9,12], salary: [15000, 28000]},
      ],
      skills: ["CCTV & Access Control Systems", "SOC Operations & SIEM", "Incident Response", "Penetration Testing (CEH)", "MHA / CSA Compliance"],
    },
    {
      id: "sustainability", name: "Sustainability", fullName: "Sustainability & ESG",
      icon: "🌱", quadrant: "delta", color: "#26a69a",
      faction: "multi", factionBonus: "ALL FACTIONS — ESG compliance now mandatory for SGX-listed companies",
      description: "Sustainability managers, environmental consultants, CSR specialists and ESG analysts. SGX mandatory ESG reporting and Singapore Green Plan 2030 making this the fastest-growing specialization.",
      status: "available", openRoles: 9,
      roles: [
        { title: "ESG Analyst",                    level: [2,4],  salary: [4000, 7000]  },
        { title: "Environmental Consultant",       level: [3,6],  salary: [5000, 9000]  },
        { title: "CSR & Community Specialist",     level: [3,5],  salary: [4500, 7500]  },
        { title: "Sustainability Manager",          level: [5,8],  salary: [8000, 14000] },
        { title: "Chief Sustainability Officer",   level: [9,13], salary: [15000, 30000]},
      ],
      skills: ["GRI / TCFD / SASB Reporting", "Carbon Accounting & LCA", "ESG Due Diligence", "Stakeholder Engagement", "Circular Economy Design"],
    },
  ]
};

// ═══════════════════════════════════════════════════════════════════════
// ELIXCRAFT BENEFITS — Singapore MOM Employment Act · CPF Board · TAFEP
// All figures based on MOM Singapore regulations effective 2025
// CPF rates: Below 55 — Employer 17%, Employee 20%, Total 37%
// Employment Act: Covers all employees (core provisions from 1 Apr 2019)
// Annual Leave minimum: 7 days yr1, +1d/yr up to 14 days (8th yr)
// Sick Leave: 14 days outpatient + 60 days hospitalisation per year
// Maternity: 16 weeks (SC/PR), 8 weeks (others) — Child Development Co-Savings Act
// Paternity: 4 weeks (SC), 2 weeks (PR/others) — effective 1 Jan 2024
// AWS (13th Month): Not legally mandated but near-universal in SG market
// ═══════════════════════════════════════════════════════════════════════
window.ELIXCRAFT_BENEFITS = {
  "meta": {
    "source": "MOM Employment Act (Cap. 91A) · CPF Board · TAFEP · SkillsFuture SG · Child Development Co-Savings Act",
    "updated": "2026-04-04",
    "note": "All benefits comply with Singapore employment law. CPF rates shown for employees below age 55."
  },
  "packages": [

    // ── BRONZE: Recruit Package (LVL 1) ──────────────────────────────────
    { "id": "starter", "name": "Recruit Package", "tier": "BRONZE", "color": "#cd7f32", "unlock_level": 1,
      "lore": "MOM-compliant entry package. Covers all statutory minimums to get your unit field-ready.",
      "slots": [
        { "id": "medishield", "name": "MediShield Life",      "icon": "❤️",  "tier": "MANDATORY",
          "stat_bonus": { "health": 5 },
          "desc": "Compulsory basic health insurance for all Singapore Citizens & PRs. Covers large hospital bills & approved outpatient treatments. Administered by CPF Board." },
        { "id": "ghs",       "name": "Group H&S Insurance",  "icon": "🏥",  "tier": "BASIC",
          "stat_bonus": { "health": 5 },
          "desc": "Group Hospitalisation & Surgical (GHS) plan. Employer-sponsored top-up above MediShield Life. Ward B2/C coverage." },
        { "id": "al",        "name": "Annual Leave",          "icon": "🏖️", "tier": "14 days",
          "stat_bonus": { "wellbeing": 8 },
          "desc": "14 days AL — statutory minimum for employees with ≥8 years service (Employment Act). Accrued pro-rata monthly. 11 paid public holidays apply separately." },
        { "id": "sick",      "name": "Sick Leave",            "icon": "🤒",  "tier": "14d + 60d hosp.",
          "stat_bonus": { "wellbeing": 5 },
          "desc": "Employment Act statutory: 14 days paid outpatient sick leave + 60 days paid hospitalisation leave per year (inclusive). Requires medical certificate." },
        { "id": "cpf",       "name": "CPF Contribution",      "icon": "🏦",  "tier": "ER 17% / EE 20%",
          "stat_bonus": { "xp": 5 },
          "desc": "Mandatory CPF. Employer contributes 17%, Employee 20% of wages (below age 55). Split across Ordinary (OA), Special (SA) & MediSave (MA) accounts. Capped at $6,800/mo ordinary wages." },
        { "id": "ns",        "name": "NS Reservist Leave",    "icon": "🎖️", "tier": "PAID",
          "stat_bonus": { "str": 3 },
          "desc": "Paid NS leave for NSmen serving IPPT, ICT or other MINDEF-directed activities. Employer pays make-up pay above MINDEF allowance per NS (Reservist) Act." },
        { "id": "trans",     "name": "Transport Allowance",   "icon": "🚇",  "tier": "SGD $100/mo",
          "stat_bonus": { "dex": 3 },
          "desc": "Monthly public transport subsidy (MRT/bus). Non-pensionable allowance, not included in CPF computation." }
      ]
    },

    // ── SILVER: Professional Package (LVL 4) ─────────────────────────────
    { "id": "professional", "name": "Professional Package", "tier": "SILVER", "color": "#a8a8a8", "unlock_level": 4,
      "lore": "Competitive mid-career armour. Exceeds statutory minimums to retain experienced units.",
      "slots": [
        { "id": "ip",        "name": "Integrated Shield Plan","icon": "❤️",  "tier": "SILVER + Rider",
          "stat_bonus": { "health": 15 },
          "desc": "MediShield Life + private Integrated Shield Plan (IP) with Rider. Covers private hospital Ward A/B1. Rider removes co-payment. Premiums partially payable via MediSave." },
        { "id": "dent",      "name": "Dental & Vision",        "icon": "🦷",  "tier": "SGD $500/yr",
          "stat_bonus": { "health": 5 },
          "desc": "Annual dental treatment + optical/spectacles claims. Note: routine dental not covered under MediShield Life. Claimable from MediSave only for approved surgical dental procedures." },
        { "id": "al",        "name": "Annual Leave",           "icon": "🏖️", "tier": "18 days",
          "stat_bonus": { "wellbeing": 12 },
          "desc": "18 days AL — exceeds Employment Act minimum. Plus 11 public holidays, 14 days outpatient sick leave & 60 days hospitalisation leave per year." },
        { "id": "mat_pat",   "name": "Maternity / Paternity",  "icon": "👶",  "tier": "Enhanced",
          "stat_bonus": { "wellbeing": 8 },
          "desc": "Maternity: 16 weeks paid (SC/PR) under Child Development Co-Savings Act. Paternity: 4 weeks paid (SC effective 1 Jan 2024). Childcare Leave: 6 days/yr per child under 7 (SC/PR)." },
        { "id": "cpf",       "name": "CPF Contribution",       "icon": "🏦",  "tier": "ER 17% standard",
          "stat_bonus": { "xp": 8 },
          "desc": "Standard employer CPF contribution at 17% of ordinary wages. Mandatory for SC/PR employees. Covers OA, SA, MA accounts per CPF Board allocation schedule." },
        { "id": "sf",        "name": "SkillsFuture & L&D",     "icon": "📚",  "tier": "SGD $1,500/yr",
          "stat_bonus": { "int": 10 },
          "desc": "Company L&D budget usable on SkillsFuture-accredited courses, professional certifications & conferences. SG Citizens aged 25+ receive additional $500 SkillsFuture Credit from government." },
        { "id": "fwa",       "name": "Flexible Work (FWA)",    "icon": "🏠",  "tier": "HYBRID",
          "stat_bonus": { "cha": 8 },
          "desc": "3 days office / 2 days WFH. Compliant with MOM's Tripartite Guidelines on FWA (effective Dec 2024). Employers must fairly consider all FWA requests in writing." }
      ]
    },

    // ── GOLD: Elite Package (LVL 7) ──────────────────────────────────────
    { "id": "elite", "name": "Elite Package", "tier": "GOLD", "color": "#ffd700", "unlock_level": 7,
      "lore": "Top-tier armour for high-value units. Maximises retention scores and performance stats.",
      "slots": [
        { "id": "ip",        "name": "Integrated Shield Plan","icon": "❤️",  "tier": "GOLD + Family",
          "stat_bonus": { "health": 30 },
          "desc": "Full family coverage under private IP with Rider. Private hospital, Ward A. No co-payment. Includes spouse and dependent children. Premiums deductible from MediSave up to annual withdrawal limits." },
        { "id": "dent",      "name": "Dental & Vision",        "icon": "🦷",  "tier": "SGD $1,000/yr",
          "stat_bonus": { "health": 10 },
          "desc": "Enhanced dental + optical. $1,000 combined annual claim. Covers orthodontic treatment, progressive lenses, and eye tests at panel clinics." },
        { "id": "al",        "name": "Annual Leave + Extras",  "icon": "🏖️", "tier": "21 days",
          "stat_bonus": { "wellbeing": 18 },
          "desc": "21 days AL + birthday leave + volunteer leave (1 day/yr per TAFEP recommendations). Plus full MOM statutory sick and hospitalisation leave entitlements." },
        { "id": "cpf_vc",    "name": "CPF Voluntary Top-Up",   "icon": "🏦",  "tier": "VC-OA / VC-SA",
          "stat_bonus": { "xp": 15 },
          "desc": "Employer voluntary CPF top-up above mandatory 17% contribution. Credited to employee's OA or SA account. Tax-deductible for employer up to $1,500/yr under RSTU scheme." },
        { "id": "equity",    "name": "Equity / Share Scheme",  "icon": "📈",  "tier": "RSU — 4yr vest",
          "stat_bonus": { "str": 15 },
          "desc": "Restricted Stock Units (RSU). 4-year vesting schedule with 1-year cliff. Performance-accelerated vesting available. Subject to IRAS income tax on vest date at open market value." },
        { "id": "sf",        "name": "SkillsFuture & L&D",     "icon": "📚",  "tier": "SGD $3,000/yr",
          "stat_bonus": { "int": 20 },
          "desc": "SGD $3,000 annual L&D budget for courses, professional certifications, conferences and executive education. Stackable with government SkillsFuture Credit and ETSS subsidies." },
        { "id": "fwa",       "name": "Full Flexible Work",     "icon": "🏠",  "tier": "FULL FWA",
          "stat_bonus": { "cha": 15 },
          "desc": "Full remote-first arrangement + co-working pass. Per MOM Tripartite FWA Guidelines (Dec 2024): employer must consider all requests in good faith and respond in writing within 2 months." },
        { "id": "well",      "name": "Wellness Allowance",     "icon": "💪",  "tier": "SGD $150/mo",
          "stat_bonus": { "wellbeing": 10 },
          "desc": "Monthly wellness budget: gym membership, mental health apps (e.g. Intellect, Wysa), annual health screening at CHAS clinic or polyclinic." }
      ]
    },

    // ── PLATINUM: Commander Package (LVL 11) ─────────────────────────────
    { "id": "commander", "name": "Commander Package", "tier": "PLATINUM", "color": "#b0e0ff", "unlock_level": 11,
      "lore": "Reserved for senior commanders. Designed to retain your most powerful and irreplaceable units.",
      "slots": [
        { "id": "ip",        "name": "Executive Medical Plan", "icon": "❤️",  "tier": "PLATINUM",
          "stat_bonus": { "health": 50 },
          "desc": "Executive-grade IP with Rider. Full family, private hospital Ward A, no co-payment. Annual health screening included. Access to SOC specialists without GP referral." },
        { "id": "dent",      "name": "Dental & Vision",        "icon": "🦷",  "tier": "UNLIMITED",
          "stat_bonus": { "health": 15 },
          "desc": "Uncapped dental and optical. Panel of private dental specialists and ophthalmologists. Covers implants, braces, LASIK consultation and premium eyewear." },
        { "id": "al",        "name": "Annual Leave",           "icon": "🏖️", "tier": "25 days",
          "stat_bonus": { "wellbeing": 25 },
          "desc": "25 days AL + birthday leave + volunteer leave + unlimited sick leave (trust-based, manager-approved). No medical certificate required for short sick absences." },
        { "id": "aws",       "name": "AWS + Variable Bonus",   "icon": "🏆",  "tier": "13mo + VB",
          "stat_bonus": { "xp": 50 },
          "desc": "Annual Wage Supplement (AWS) — 13th month salary. Not legally mandated but included as guaranteed. Variable Bonus (VB): 1–3 months based on company & individual performance. Subject to IRAS income tax." },
        { "id": "cpf_ex",    "name": "CPF Enhanced Top-Up",    "icon": "🏦",  "tier": "Premium VC",
          "stat_bonus": { "xp": 20 },
          "desc": "Maximum voluntary employer CPF contribution to employee's SA/OA. Accelerates retirement compounding. Employer contributions are tax-deductible; additional relief under RSTU applies." },
        { "id": "equity",    "name": "Executive Share Scheme",  "icon": "📈",  "tier": "RSU + ESOP",
          "stat_bonus": { "str": 25 },
          "desc": "RSU with performance-accelerated vesting + Employee Share Option Plan (ESOP). IRAS: gains taxed as employment income on vest/exercise date. Subject to Stock Option Reporting requirements." },
        { "id": "exec_dev",  "name": "Executive Development",  "icon": "🎓",  "tier": "UNLIMITED",
          "stat_bonus": { "int": 30 },
          "desc": "Executive MBA (NUS/NTU/INSEAD), board-level leadership programmes, ICF-certified executive coaching, overseas conference allowance. No annual cap." },
        { "id": "car",       "name": "Car Allowance",          "icon": "🚗",  "tier": "SGD $2,000/mo",
          "stat_bonus": { "dex": 20 },
          "desc": "Monthly car allowance or chauffeured transport (Grab Business). Treated as taxable income under IRAS. COE costs factored into gross compensation review." },
        { "id": "well",      "name": "Wellness & Concierge",   "icon": "💆",  "tier": "PREMIUM",
          "stat_bonus": { "wellbeing": 20 },
          "desc": "Premium gym (e.g. Anytime Fitness, Virgin Active), executive health screening at private hospital, mental wellness sessions, personal concierge for travel & lifestyle." }
      ]
    }
  ]
};
