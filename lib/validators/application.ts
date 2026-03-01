import { z } from 'zod';

/**
 * Zod schema for project application input validation
 */
export const applicationSchema = z.object({
  projectSlug: z.string().min(1, 'Project slug is required'),
  companyName: z.string().min(1, 'Company name is required').max(200),
  companyEmail: z.string().email('Invalid email address'),
  companyWebsite: z
    .string()
    .url('Invalid URL format')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must start with http:// or https://'),
  contactPerson: z.string().min(1, 'Contact person is required').max(200),
  contactDetails: z.string().min(1, 'Contact details are required').max(500),
  message: z.string().min(1, 'Message is required').max(5000),
  // Honeypot field - should be empty
  website2: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
