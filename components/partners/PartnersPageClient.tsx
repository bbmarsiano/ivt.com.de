'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { Partner } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const selectTriggerClass =
  'bg-white text-black border border-gray-600 rounded-md appearance-none pr-8 relative w-full [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500 [&>svg]:pointer-events-none';

interface PartnersPageClientProps {
  partners: Partner[];
}

export function PartnersPageClient({ partners }: PartnersPageClientProps) {
  const { language, t } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');
  const [activity, setActivity] = useState('all');
  const [formVisible, setFormVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', contact: '', projectInterest: '' });

  const filteredPartners = useMemo(() => {
    let list = partners;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [partners, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col">
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.partners.title}</h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              {t.pages.partners.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-10">
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t.pages.partners.intro}
            </p>
          </div>

          <div className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-end">
              <div className="w-full">
                <Label htmlFor="partner-search" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.partners.filterSearchPlaceholder}
                </Label>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="partner-search"
                    type="text"
                    placeholder={t.pages.partners.filterSearchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full bg-white text-black placeholder:text-gray-500 border-gray-600"
                  />
                </div>
              </div>
              <div className="w-full">
                <Label htmlFor="partner-location" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.partners.filterLocation}
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="partner-location" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.pages.partners.allLocations}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <Label htmlFor="partner-activity" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.partners.filterActivity}
                </Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger id="partner-activity" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.pages.partners.allActivities}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      {partner.logo && !imageErrors.has(partner.id) ? (
                        <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-4 overflow-hidden">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-full h-full object-contain"
                            onError={() => {
                              setImageErrors((prev) => new Set(prev).add(partner.id));
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-4">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mb-2">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'de' ? 'Strategischer Partner' : 'Strategic Partner'}
                      </p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-sm text-primary hover:underline"
                        >
                          {language === 'de' ? 'Website besuchen' : 'Visit Website'}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="ivt-frame rounded-lg border border-white/10 bg-black/30 px-6 py-8 md:px-8 md:py-10 max-w-4xl mx-auto"
          >
            <h2 className="section-title mb-4">
              {t.pages.partners.becomePartner.title}
            </h2>
            <p className="text-white/80 mb-6">
              {t.pages.partners.becomePartner.intro}
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-primary mt-1">•</span>
                {t.pages.partners.becomePartner.benefit1}
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-primary mt-1">•</span>
                {t.pages.partners.becomePartner.benefit2}
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <span className="text-primary mt-1">•</span>
                {t.pages.partners.becomePartner.benefit3}
              </li>
            </ul>
            {!formVisible && !submitted && (
              <Button
                type="button"
                onClick={() => setFormVisible(true)}
                className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                {t.pages.partners.becomePartner.ctaButton}
              </Button>
            )}
            {formVisible && !submitted && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <Label htmlFor="partner-company" className="text-white">
                    {t.pages.partners.becomePartner.formCompanyName}
                  </Label>
                  <Input
                    id="partner-company"
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-contact" className="text-white">
                    {t.pages.partners.becomePartner.formContact}
                  </Label>
                  <Input
                    id="partner-contact"
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-interest" className="text-white">
                    {t.pages.partners.becomePartner.formProjectInterest}
                  </Label>
                  <Textarea
                    id="partner-interest"
                    rows={4}
                    value={formData.projectInterest}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectInterest: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  {t.pages.partners.becomePartner.submitButton}
                </Button>
              </form>
            )}
            {submitted && (
              <p className="text-white font-medium pt-4">
                {t.pages.partners.becomePartner.successMessage}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
