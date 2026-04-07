export const DOMAIN_DATA = {
  "Programming": {
    icon: "code",
    subTracks: [
      "C Programming", "C++ Programming", "Java Programming",
      "Python Programming", "Object-Oriented Programming",
      "Data Structures", "Advanced Data Structures",
      "Design and Analysis of Algorithms"
    ]
  },
  "Web Development": {
    icon: "globe",
    subTracks: [
      "Frontend (HTML/CSS/JS/React)", "Backend (Node.js/Express/Django)",
      "Full Stack Development", "Web Security", "Angular", "Spring Boot"
    ]
  },
  "Mobile Development": {
    icon: "smartphone",
    subTracks: [
      "Android Development", "iOS Development",
      "Flutter", "React Native"
    ]
  },
  "Artificial Intelligence": {
    icon: "brain",
    subTracks: [
      "AI Basics", "Machine Learning", "Supervised Learning",
      "Unsupervised Learning", "Deep Learning",
      "Natural Language Processing", "Computer Vision"
    ]
  },
  "Data Science": {
    icon: "bar-chart",
    subTracks: [
      "Data Analysis", "Data Mining",
      "Big Data Analytics", "Data Visualization"
    ]
  },
  "Database Systems": {
    icon: "database",
    subTracks: [
      "DBMS", "SQL", "NoSQL",
      "Database Design", "Data Warehousing"
    ]
  },
  "Systems & Core CS": {
    icon: "cpu",
    subTracks: [
      "Operating Systems", "Advanced Operating Systems",
      "Computer Organization", "Computer Architecture", "Real-Time Systems"
    ]
  },
  "Networking": {
    icon: "network",
    subTracks: [
      "Computer Networks", "Advanced Networking", "Wireless Networks"
    ]
  },
  "Cybersecurity": {
    icon: "shield",
    subTracks: [
      "Cybersecurity Basics", "Cryptography", "Network Security",
      "Ethical Hacking", "Digital Forensics"
    ]
  },
  "Cloud & DevOps": {
    icon: "cloud",
    subTracks: [
      "AWS", "Azure", "Google Cloud",
      "DevOps & CI/CD", "Docker", "Kubernetes"
    ]
  },
  "Software Engineering": {
    icon: "layers",
    subTracks: [
      "SDLC", "Agile Methodologies",
      "Software Testing", "Software Project Management"
    ]
  },
  "Theory & Mathematics": {
    icon: "function",
    subTracks: [
      "Discrete Mathematics", "Linear Algebra",
      "Probability & Statistics", "Theory of Computation", "Compiler Design"
    ]
  },
  "Emerging Technologies": {
    icon: "zap",
    subTracks: [
      "Blockchain", "IoT",
      "Quantum Computing", "AR/VR", "Robotics"
    ]
  },
  "Specialized Domains": {
    icon: "star",
    subTracks: [
      "Game Development", "Image Processing",
      "Pattern Recognition", "Bioinformatics", "Information Retrieval"
    ]
  }
}

export const DEPENDENCY_MAP: Record<string, string[]> = {
  "Machine Learning": ["Python Programming", "Linear Algebra", "Probability & Statistics"],
  "Deep Learning": ["Machine Learning", "Python Programming", "Linear Algebra"],
  "Natural Language Processing": ["Python Programming", "Machine Learning"],
  "Computer Vision": ["Python Programming", "Deep Learning", "Image Processing"],
  "Ethical Hacking": ["Computer Networks", "Operating Systems", "Cybersecurity Basics"],
  "Network Security": ["Computer Networks", "Cryptography"],
  "Docker": ["Operating Systems", "Computer Networks"],
  "Kubernetes": ["Docker", "Cloud Computing"],
  "Compiler Design": ["Theory of Computation", "Discrete Mathematics"],
  "Data Mining": ["SQL", "Python Programming", "Probability & Statistics"],
  "Full Stack Development": ["Frontend (HTML/CSS/JS/React)", "Backend (Node.js/Express/Django)"],
  "Advanced Data Structures": ["Data Structures", "Design and Analysis of Algorithms"]
}
