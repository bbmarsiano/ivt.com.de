'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';

const THURINGIA_MAP_EMBED_SRC =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL
    ? process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL
    : 'https://www.openstreetmap.org/export/embed.html?bbox=9.5%2C50.0%2C12.5%2C51.8&layer=map&marker=51.0%2C11.0';

const SOCIAL_LINKS = [
  { key: 'linkedin', href: 'https://www.linkedin.com/company/innovation-valley-thueringen', icon: Linkedin, label: 'LinkedIn' },
  { key: 'x', href: 'https://x.com/innovationvalley', icon: Twitter, label: 'X (Twitter)' },
];

export default function ContactPage() {
  const { language, t } = useLanguage();

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@innovationvalley-thueringen.de',
    },
    {
      icon: Phone,
      title: { de: 'Telefon', en: 'Phone' },
      value: '+49 (0) 123 456 789',
    },
    {
      icon: MapPin,
      title: { de: 'Adresse', en: 'Address' },
      value: 'Innovation Valley Thüringen, 99084 Erfurt',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="section-spacing bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.contact.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.contact.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title text-2xl font-semibold mb-6">
                {language === 'de' ? 'Kontaktinformationen' : 'Contact Information'}
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="rounded-md border border-white/10 bg-white/5 p-2 flex-shrink-0">
                          <info.icon className="ivt-icon-md text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {typeof info.title === 'string' ? info.title : info.title[language]}
                          </h3>
                          <p className="text-muted-foreground">{info.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">
                    {language === 'de' ? 'Nachricht senden' : 'Send Message'}
                  </h2>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === 'de' ? 'Name' : 'Name'}
                      </Label>
                      <Input id="name" placeholder={language === 'de' ? 'Ihr Name' : 'Your name'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={language === 'de' ? 'Ihre E-Mail' : 'Your email'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {language === 'de' ? 'Nachricht' : 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder={language === 'de' ? 'Ihre Nachricht' : 'Your message'}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {language === 'de' ? 'Absenden' : 'Send'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h2 className="section-title text-2xl font-semibold mb-4">
              {t.pages.contact.mapHeading}
            </h2>
            <div className="rounded-lg border border-white/10 overflow-hidden bg-black/20 aspect-video max-w-4xl">
              <iframe
                title="Thuringia region map"
                src={THURINGIA_MAP_EMBED_SRC}
                className="w-full h-full min-h-[280px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h2 className="section-title text-2xl font-semibold mb-4">
              {t.pages.contact.socialHeading}
            </h2>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ key, href, icon: Icon, label }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 max-w-3xl"
          >
            <h2 className="section-title text-2xl font-semibold mb-4">
              {t.pages.contact.faqHeading}
            </h2>
            <Accordion type="single" collapsible className="rounded-lg border border-white/10 bg-black/20">
              <AccordionItem value="faq1" className="border-white/10 px-4">
                <AccordionTrigger className="text-left text-white hover:no-underline hover:text-white/90 py-4">
                  {t.pages.contact.faq1Q}
                </AccordionTrigger>
                <AccordionContent className="text-white/80 pb-4">
                  {t.pages.contact.faq1A}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
