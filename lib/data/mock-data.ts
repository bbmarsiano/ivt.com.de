export interface Project {
  id: string;
  slug: string;
  title: {
    de: string;
    en: string;
  };
  description: {
    de: string;
    en: string;
  };
  image: string;
  category: string;
  date: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
}

export interface NewsItem {
  id: string;
  title: {
    de: string;
    en: string;
  };
  excerpt: {
    de: string;
    en: string;
  };
  date: string;
  image: string;
}

export interface Event {
  id: string;
  title: {
    de: string;
    en: string;
  };
  description: {
    de: string;
    en: string;
  };
  date: string;
  location: string;
  image: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    slug: 'ai-research-hub',
    title: {
      de: 'KI-Forschungszentrum',
      en: 'AI Research Hub',
    },
    description: {
      de: 'Führendes Forschungszentrum für künstliche Intelligenz und maschinelles Lernen.',
      en: 'Leading research center for artificial intelligence and machine learning.',
    },
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    category: 'Technology',
    date: '2024-01-15',
  },
  {
    id: '2',
    slug: 'sustainable-mobility',
    title: {
      de: 'Nachhaltige Mobilität',
      en: 'Sustainable Mobility',
    },
    description: {
      de: 'Innovative Lösungen für umweltfreundliche Transportmittel.',
      en: 'Innovative solutions for environmentally friendly transportation.',
    },
    image: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg',
    category: 'Mobility',
    date: '2024-02-20',
  },
  {
    id: '3',
    slug: 'digital-health',
    title: {
      de: 'Digitale Gesundheit',
      en: 'Digital Health',
    },
    description: {
      de: 'Modernisierung des Gesundheitswesens durch digitale Technologien.',
      en: 'Modernizing healthcare through digital technologies.',
    },
    image: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
    category: 'Health',
    date: '2024-03-10',
  },
];

export const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'TechCorp',
    logo: '/placeholder-logo.svg',
    website: 'https://example.com',
  },
  {
    id: '2',
    name: 'InnovateLab',
    logo: '/placeholder-logo.svg',
    website: 'https://example.com',
  },
  {
    id: '3',
    name: 'FutureVentures',
    logo: '/placeholder-logo.svg',
    website: 'https://example.com',
  },
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: {
      de: 'Neue Förderprogramme angekündigt',
      en: 'New Funding Programs Announced',
    },
    excerpt: {
      de: 'Innovation Valley Thüringen kündigt neue Förderprogramme für Start-ups an.',
      en: 'Innovation Valley Thuringia announces new funding programs for startups.',
    },
    date: '2024-01-20',
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
  },
  {
    id: '2',
    title: {
      de: 'Erfolgreicher Launch eines KI-Start-ups',
      en: 'Successful Launch of AI Startup',
    },
    excerpt: {
      de: 'Ein Thüringer KI-Start-up sichert sich Series-A-Finanzierung.',
      en: 'A Thuringian AI startup secures Series A funding.',
    },
    date: '2024-02-15',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: {
      de: 'Innovation Summit 2024',
      en: 'Innovation Summit 2024',
    },
    description: {
      de: 'Jahreskonferenz für Innovation und Technologie in Thüringen.',
      en: 'Annual conference for innovation and technology in Thuringia.',
    },
    date: '2024-06-15',
    location: 'Erfurt',
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
  },
  {
    id: '2',
    title: {
      de: 'Start-up Pitch Night',
      en: 'Startup Pitch Night',
    },
    description: {
      de: 'Networking-Event für Start-ups und Investoren.',
      en: 'Networking event for startups and investors.',
    },
    date: '2024-04-20',
    location: 'Jena',
    image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
  },
];

export interface TeamMember {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  role_de: string;
  role_en: string;
  bio_de: string;
  bio_en: string;
  email?: string;
  linkedin?: string;
  avatar_file?: string | null;
  sort: number;
  featured: boolean;
  createdAt: string;
}

export const mockTeam: TeamMember[] = [
  {
    id: '1',
    slug: 'dr-anna-mueller',
    first_name: 'Anna',
    last_name: 'Müller',
    role_de: 'Geschäftsführerin',
    role_en: 'Managing Director',
    bio_de: 'Expertin für Innovationsmanagement mit über 15 Jahren Erfahrung in der Technologiebranche.',
    bio_en: 'Expert in innovation management with over 15 years of experience in the technology sector.',
    email: 'anna.mueller@ivt.de',
    linkedin: 'https://linkedin.com/in/annamueller',
    sort: 1,
    featured: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    slug: 'prof-dr-thomas-schmidt',
    first_name: 'Thomas',
    last_name: 'Schmidt',
    role_de: 'Wissenschaftlicher Leiter',
    role_en: 'Scientific Director',
    bio_de: 'Professor für angewandte Informatik und Leiter mehrerer Forschungsprojekte.',
    bio_en: 'Professor of applied computer science and leader of multiple research projects.',
    email: 'thomas.schmidt@ivt.de',
    linkedin: 'https://linkedin.com/in/thomasschmidt',
    sort: 2,
    featured: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    slug: 'sarah-weber',
    first_name: 'Sarah',
    last_name: 'Weber',
    role_de: 'Projektmanagerin',
    role_en: 'Project Manager',
    bio_de: 'Spezialistin für Projektkoordination und Stakeholder-Management.',
    bio_en: 'Specialist in project coordination and stakeholder management.',
    email: 'sarah.weber@ivt.de',
    linkedin: 'https://linkedin.com/in/sarahweber',
    sort: 3,
    featured: false,
    createdAt: '2024-01-15T00:00:00Z',
  },
];

export interface AboutContent {
  id: string;
  title_de: string;
  title_en: string;
  intro_de: string;
  intro_en: string;
  mission_de: string;
  mission_en: string;
  vision_de: string;
  vision_en: string;
  createdAt: string;
  updatedAt: string;
}

export const mockAboutContent: AboutContent = {
  id: '1',
  title_de: 'Über Innovation Valley Thüringen',
  title_en: 'About Innovation Valley Thuringia',
  intro_de: 'Innovation Valley Thüringen ist die zentrale Plattform für Innovation, Technologie und wirtschaftliche Entwicklung in Thüringen. Wir bringen die besten Köpfe aus Wissenschaft, Wirtschaft und Politik zusammen, um bahnbrechende Lösungen für die Herausforderungen von heute und morgen zu entwickeln.',
  intro_en: 'Innovation Valley Thuringia is the central platform for innovation, technology, and economic development in Thuringia. We bring together the best minds from science, business, and government to develop groundbreaking solutions for today\'s and tomorrow\'s challenges.',
  mission_de: 'Mit einem starken Netzwerk aus Partnern, modernster Infrastruktur und einem engagierten Team schaffen wir optimale Bedingungen für Innovation und Wachstum.',
  mission_en: 'With a strong network of partners, state-of-the-art infrastructure, and a dedicated team, we create optimal conditions for innovation and growth.',
  vision_de: 'Thüringen als führenden Innovationsstandort etablieren und die Zukunft der Technologie gestalten.',
  vision_en: 'Establish Thuringia as a leading innovation hub and shape the future of technology.',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

// Fallback hero image URL (used when no Directus image is set)
export const ABOUT_HERO_FALLBACK_IMAGE = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';

// ============================================================================
// RESOURCES MOCK DATA
// ============================================================================

import type { Resource, ResourceCategory, ResourceType } from '@/lib/types/content';

export const mockResourceCategories: ResourceCategory[] = [
  {
    id: '1',
    key: 'project',
    title_de: 'Projekt',
    title_en: 'Project',
    sort: 1,
  },
  {
    id: '2',
    key: 'public',
    title_de: 'Öffentlich',
    title_en: 'Public',
    sort: 2,
  },
  {
    id: '3',
    key: 'other',
    title_de: 'Sonstiges',
    title_en: 'Other',
    sort: 3,
  },
];

export const mockResources: Resource[] = [
  // Project-linked resources (shared across projects)
  {
    id: '1',
    key: 'ai-research-whitepaper',
    title_de: 'KI-Forschung Whitepaper',
    title_en: 'AI Research Whitepaper',
    description_de: 'Umfassendes Whitepaper über aktuelle KI-Forschungstrends.',
    description_en: 'Comprehensive whitepaper on current AI research trends.',
    type: 'PDF' as ResourceType,
    file_id: null,
    external_url: 'https://example.com/ai-research-whitepaper.pdf',
    gated: false,
    visible: true,
    published_at: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    downloadUrl: 'https://example.com/ai-research-whitepaper.pdf',
    externalUrl: 'https://example.com/ai-research-whitepaper.pdf',
  },
  {
    id: '2',
    key: 'sustainable-mobility-guide',
    title_de: 'Leitfaden für nachhaltige Mobilität',
    title_en: 'Sustainable Mobility Guide',
    description_de: 'Praktischer Leitfaden für nachhaltige Mobilitätslösungen.',
    description_en: 'Practical guide for sustainable mobility solutions.',
    type: 'PDF' as ResourceType,
    file_id: null,
    external_url: 'https://example.com/sustainable-mobility-guide.pdf',
    gated: false,
    visible: true,
    published_at: '2024-02-20T00:00:00Z',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
    downloadUrl: 'https://example.com/sustainable-mobility-guide.pdf',
    externalUrl: 'https://example.com/sustainable-mobility-guide.pdf',
  },
  {
    id: '3',
    key: 'digital-health-presentation',
    title_de: 'Digitale Gesundheit Präsentation',
    title_en: 'Digital Health Presentation',
    description_de: 'Präsentation über digitale Gesundheitslösungen.',
    description_en: 'Presentation on digital health solutions.',
    type: 'PPT' as ResourceType,
    file_id: null,
    external_url: 'https://example.com/digital-health-presentation.pptx',
    gated: true,
    visible: true,
    published_at: '2024-03-10T00:00:00Z',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    downloadUrl: 'https://example.com/digital-health-presentation.pptx',
    externalUrl: 'https://example.com/digital-health-presentation.pptx',
  },
  // Public resources (no project links, category 'public')
  {
    id: '4',
    key: 'public-funding-guide',
    title_de: 'Öffentlicher Förderleitfaden',
    title_en: 'Public Funding Guide',
    description_de: 'Allgemeiner Leitfaden zu öffentlichen Fördermöglichkeiten.',
    description_en: 'General guide to public funding opportunities.',
    type: 'PDF' as ResourceType,
    file_id: null,
    external_url: 'https://example.com/public-funding-guide.pdf',
    gated: false,
    visible: true,
    published_at: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    downloadUrl: 'https://example.com/public-funding-guide.pdf',
    externalUrl: 'https://example.com/public-funding-guide.pdf',
  },
  {
    id: '5',
    key: 'innovation-network-link',
    title_de: 'Innovationsnetzwerk',
    title_en: 'Innovation Network',
    description_de: 'Link zum Innovationsnetzwerk Thüringen.',
    description_en: 'Link to the Thuringia Innovation Network.',
    type: 'LINK' as ResourceType,
    file_id: null,
    external_url: 'https://innovation-network-thuringia.de',
    gated: false,
    visible: true,
    published_at: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    downloadUrl: 'https://innovation-network-thuringia.de',
    externalUrl: 'https://innovation-network-thuringia.de',
  },
  // Other category resources
  {
    id: '6',
    key: 'general-info-doc',
    title_de: 'Allgemeine Informationen',
    title_en: 'General Information',
    description_de: 'Allgemeines Informationsdokument.',
    description_en: 'General information document.',
    type: 'DOC' as ResourceType,
    file_id: null,
    external_url: 'https://example.com/general-info.docx',
    gated: false,
    visible: true,
    published_at: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    downloadUrl: 'https://example.com/general-info.docx',
    externalUrl: 'https://example.com/general-info.docx',
  },
];

// Mock mapping: resource key -> project slugs (for seeding)
export const mockResourceProjectLinks: Record<string, string[]> = {
  'ai-research-whitepaper': ['ai-research-hub', 'digital-health'], // Shared across 2 projects
  'sustainable-mobility-guide': ['sustainable-mobility'],
  'digital-health-presentation': ['digital-health'],
  'innovation-network-link': ['renewable-energy-grid'], // Demo link as requested
};

// Mock mapping: resource key -> category keys
export const mockResourceCategoryLinks: Record<string, string[]> = {
  'ai-research-whitepaper': ['project'],
  'sustainable-mobility-guide': ['project'],
  'digital-health-presentation': ['project'],
  'public-funding-guide': ['public'],
  'innovation-network-link': ['public'],
  'general-info-doc': ['other'],
};
