'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { ProjectIndustry, ProjectStatus } from '@/lib/mock/projects';
import { Search } from 'lucide-react';

const selectTriggerClass =
  'bg-white text-gray-900 border border-gray-600 rounded-md appearance-none pr-8 relative [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500 [&>svg]:pointer-events-none';

export interface FilterState {
  search: string;
  industry: ProjectIndustry | 'all';
  status: ProjectStatus | 'all';
  sortBy: 'newest' | 'featured' | 'title';
}

interface ProjectFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function ProjectFilters({ filters, onFilterChange }: ProjectFiltersProps) {
  const { t } = useLanguage();

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleIndustryChange = (value: string) => {
    onFilterChange({ ...filters, industry: value as ProjectIndustry | 'all' });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as ProjectStatus | 'all' });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value as FilterState['sortBy'] });
  };

  return (
    <div className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:max-w-[220px]">
          <Label htmlFor="search" className="mb-2 block text-sm font-medium text-white">
            {t.pages.projects.searchPlaceholder}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <Input
              id="search"
              type="text"
              placeholder={t.pages.projects.searchPlaceholder}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 text-white placeholder:text-gray-300"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="industry" className="mb-2 block text-sm font-medium text-white">
            {t.pages.projects.filterIndustry}
          </Label>
          <Select value={filters.industry} onValueChange={handleIndustryChange}>
            <SelectTrigger id="industry" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.pages.projects.allIndustries}</SelectItem>
              <SelectItem value="tech">{t.pages.projects.industries.tech}</SelectItem>
              <SelectItem value="manufacturing">
                {t.pages.projects.industries.manufacturing}
              </SelectItem>
              <SelectItem value="green_energy">
                {t.pages.projects.industries.green_energy}
              </SelectItem>
              <SelectItem value="defense">{t.pages.projects.industries.defense}</SelectItem>
              <SelectItem value="other">{t.pages.projects.industries.other}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status" className="mb-2 block text-sm font-medium text-white">
            {t.pages.projects.filterStatus}
          </Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.pages.projects.statuses.all}</SelectItem>
              <SelectItem value="ongoing">{t.pages.projects.statuses.ongoing}</SelectItem>
              <SelectItem value="completed">{t.pages.projects.statuses.completed}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Label htmlFor="sort" className="mb-2 block text-sm font-medium text-white">
            {t.pages.projects.sortBy}
          </Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger id="sort" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t.pages.projects.sortOptions.newest}</SelectItem>
              <SelectItem value="featured">{t.pages.projects.sortOptions.featured}</SelectItem>
              <SelectItem value="title">{t.pages.projects.sortOptions.title}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
