# Directus Model Contract

This document describes the exact TypeScript interfaces and field structures used in the codebase. This is the source of truth for what the Directus schema should match.

## Projects (`projects`)

**Source**: `lib/types/content.ts` - `Project` interface  
**Mock Data**: `lib/mock/projects.ts`

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `id` | `string` | Yes | UUID |
| `slug` | `string` | Yes | Unique identifier |
| `status` | `'ongoing' \| 'completed'` | Yes | Enum: `ongoing`, `completed` |
| `industry` | `'tech' \| 'manufacturing' \| 'green_energy' \| 'defense' \| 'other'` | Yes | Enum: `tech`, `manufacturing`, `green_energy`, `defense`, `other` |
| `title_de` | `string` | Yes | German title |
| `title_en` | `string` | Yes | English title |
| `summary_de` | `string` | Yes | German summary |
| `summary_en` | `string` | Yes | English summary |
| `description_de` | `string` | Yes | German description (can contain newlines) |
| `description_en` | `string` | Yes | English description (can contain newlines) |
| `thumbnail` | `string` | Yes | URL to thumbnail image |
| `images` | `string[]` | Yes | Array of image URLs |
| `tags` | `string[]` | Yes | Array of tag strings |
| `featured` | `boolean` | Yes | Default: `false` |
| `coordinator` | `ProjectCoordinator` | Yes | **Nested object** (see below) |
| `metrics` | `ProjectMetrics \| undefined` | No | **Nested object** (see below) |
| `eligibility_de` | `string[]` | Yes | Array of German eligibility strings |
| `eligibility_en` | `string[]` | Yes | Array of English eligibility strings |
| `documents` | `ProjectDocument[]` | Yes | **Array of objects** (see below) |
| `createdAt` | `string` | Yes | ISO date string |

### Nested Objects

#### `coordinator` (ProjectCoordinator)
```typescript
{
  name: string;                    // Required
  title: {                         // Nested bilingual object
    de: string;
    en: string;
  };
  email: string;                   // Required
  phone: string;                  // Required
  avatar?: string;                 // Optional
}
```

**Directus Representation**: Store as JSON field `coordinator` (nested object with bilingual `title`)

#### `metrics` (ProjectMetrics) - Optional
```typescript
{
  budget?: string;
  duration?: string;
  partners?: number;
  jobs?: number;
}
```

**Directus Representation**: Store as JSON field `metrics`

#### `documents` (ProjectDocument[])
```typescript
Array<{
  id: string;
  filename: string;
  type: string;
  size: string;
}>
```

**Directus Representation**: Store as JSON field `documents` (array of objects)

### Bilingual Fields

- Uses `*_de` and `*_en` suffix pattern for `title`, `summary`, `description`, `eligibility`
- Uses nested object `coordinator.title.de/en` for coordinator title

### Arrays

- `images`: `string[]` - Array of image URLs
- `tags`: `string[]` - Array of tag strings
- `eligibility_de`: `string[]` - Array of eligibility strings
- `eligibility_en`: `string[]` - Array of eligibility strings
- `documents`: `ProjectDocument[]` - Array of document objects

## Events (`events`)

**Source**: `lib/types/content.ts` - `EventItem` interface  
**Mock Data**: `lib/mock/events.ts`

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `id` | `string` | Yes | UUID |
| `slug` | `string` | Yes | Unique identifier |
| `title_de` | `string` | Yes | German title |
| `title_en` | `string` | Yes | English title |
| `description_de` | `string` | Yes | German description |
| `description_en` | `string` | Yes | English description |
| `location` | `string` | Yes | Location string (not bilingual) |
| `start_at` | `string` | Yes | ISO datetime string |
| `end_at` | `string` | Yes | ISO datetime string |
| `cover` | `string \| undefined` | No | URL to cover image |

### Bilingual Fields

- Uses `*_de` and `*_en` suffix pattern for `title` and `description`
- `location` is **not** bilingual (single string)

## News (`news`)

**Source**: `lib/types/content.ts` - `NewsPost` interface  
**Mock Data**: `lib/mock/news.ts`

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `id` | `string` | Yes | UUID |
| `slug` | `string` | Yes | Unique identifier |
| `title_de` | `string` | Yes | German title |
| `title_en` | `string` | Yes | English title |
| `summary_de` | `string` | Yes | German summary |
| `summary_en` | `string` | Yes | English summary |
| `published_at` | `string` | Yes | ISO datetime string |
| `cover` | `string \| undefined` | No | URL to cover image |
| `tags` | `string[]` | Yes | Array of tag strings |

### Bilingual Fields

- Uses `*_de` and `*_en` suffix pattern for `title` and `summary`

### Arrays

- `tags`: `string[]` - Array of tag strings

## Testimonials (`testimonials`)

**Source**: `lib/types/content.ts` - `Testimonial` interface  
**Mock Data**: `lib/mock/testimonials.ts`

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `id` | `string` | Yes | UUID |
| `quote_de` | `string` | Yes | German quote |
| `quote_en` | `string` | Yes | English quote |
| `author_name` | `string` | Yes | Author name |
| `author_title_de` | `string` | Yes | German author title |
| `author_title_en` | `string` | Yes | English author title |
| `company_name` | `string` | Yes | Company name |
| `company_logo` | `string \| undefined` | No | URL to company logo |
| `featured` | `boolean` | Yes | Default: `false` |

### Bilingual Fields

- Uses `*_de` and `*_en` suffix pattern for `quote` and `author_title`

## Partners (`partners`)

**Status**: ⚠️ **Not currently implemented in code**

**Note**: There is a `Partner` interface in `lib/data/mock-data.ts` but it's not used by `contentService.ts`:
```typescript
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
}
```

**Recommendation**: Wait for implementation in `contentService.ts` before adding to Directus schema.

## Team (`team`)

**Status**: ⚠️ **Not currently implemented in code**

**Note**: No TypeScript interface or mock data found for team members.

**Recommendation**: Wait for implementation before adding to Directus schema.

## Resources (`resources`)

**Status**: ⚠️ **Not currently implemented in code**

**Note**: No TypeScript interface or mock data found for resources.

**Recommendation**: Wait for implementation before adding to Directus schema.

## Summary

### Implemented Collections (from code)
1. ✅ **projects** - Fully defined with nested objects and arrays
2. ✅ **events** - Fully defined
3. ✅ **news** - Fully defined
4. ✅ **testimonials** - Fully defined

### Not Yet Implemented
- ❌ **partners** - Interface exists but not used by contentService
- ❌ **team** - No interface found
- ❌ **resources** - No interface found

## Bilingual Field Patterns

The codebase uses **two patterns** for bilingual content:

1. **Suffix pattern** (`*_de`, `*_en`): Used for most fields
   - `title_de`, `title_en`
   - `summary_de`, `summary_en`
   - `description_de`, `description_en`
   - `eligibility_de`, `eligibility_en`
   - `quote_de`, `quote_en`
   - `author_title_de`, `author_title_en`

2. **Nested object pattern**: Used for `coordinator.title`
   ```typescript
   coordinator: {
     title: { de: string, en: string }
   }
   ```

**Directus Schema Decision**: 
- Use JSON fields for nested objects (`coordinator`, `metrics`, `documents`)
- Use `*_de`/`*_en` suffix pattern for all other bilingual fields (matches code)

## Array Fields

Arrays are represented as:
- **String arrays**: `tags`, `images`, `eligibility_de`, `eligibility_en` → JSON array of strings
- **Object arrays**: `documents` → JSON array of objects

**Directus Schema Decision**: Use JSON fields for all arrays (matches code structure exactly)

## Required vs Optional

Based on mock data analysis:
- All fields with `?` in TypeScript are optional
- All fields without `?` are required
- Arrays are always present (empty array `[]` if no items)
- `metrics` is the only optional top-level field in `Project`
