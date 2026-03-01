import type { Testimonial } from '@/lib/types/content';

export type { Testimonial };

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    quote_de: 'Innovation Valley Thüringen hat uns geholfen, unsere KI-Forschung auf das nächste Level zu bringen. Die Zusammenarbeit mit führenden Experten und der Zugang zu modernster Infrastruktur waren entscheidend für unseren Erfolg.',
    quote_en: 'Innovation Valley Thuringia helped us take our AI research to the next level. The collaboration with leading experts and access to state-of-the-art infrastructure were crucial to our success.',
    author_name: 'Dr. Michael Schneider',
    author_title_de: 'CEO',
    author_title_en: 'CEO',
    company_name: 'TechVision AI',
    featured: true,
  },
  {
    id: '2',
    quote_de: 'Als Mittelständler haben wir durch das Innovation Valley die perfekte Plattform gefunden, um unsere Produktionsprozesse zu digitalisieren. Die Unterstützung war außergewöhnlich.',
    quote_en: 'As a medium-sized company, we found the perfect platform through Innovation Valley to digitize our production processes. The support was exceptional.',
    author_name: 'Andrea Hoffmann',
    author_title_de: 'Geschäftsführerin',
    author_title_en: 'Managing Director',
    company_name: 'Hoffmann Präzisionsteile GmbH',
    featured: true,
  },
  {
    id: '3',
    quote_de: 'Die Vernetzung mit anderen innovativen Unternehmen und die gemeinsame Arbeit an zukunftsweisenden Projekten macht Thüringen zu einem einzigartigen Innovationsstandort.',
    quote_en: 'The networking with other innovative companies and the joint work on future-oriented projects makes Thuringia a unique innovation location.',
    author_name: 'Prof. Dr. Stefan Weber',
    author_title_de: 'Institutsleiter',
    author_title_en: 'Institute Director',
    company_name: 'Fraunhofer-Institut',
    featured: true,
  },
  {
    id: '4',
    quote_de: 'Dank Innovation Valley konnten wir unsere grüne Energielösung schneller zur Marktreife bringen. Die Expertise und das Netzwerk sind unschätzbar wertvoll.',
    quote_en: 'Thanks to Innovation Valley, we were able to bring our green energy solution to market maturity faster. The expertise and network are invaluable.',
    author_name: 'Julia Becker',
    author_title_de: 'Gründerin & CTO',
    author_title_en: 'Founder & CTO',
    company_name: 'GreenTech Solutions',
    featured: false,
  },
];
