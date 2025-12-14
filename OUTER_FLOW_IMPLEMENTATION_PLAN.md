# Outer Flow Implementation Plan
**LawEthic Service Landing Pages - Complete Guide**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current State vs. Target State](#current-state-vs-target-state)
3. [UI Libraries & Tech Stack](#ui-libraries--tech-stack)
4. [Data Model & Architecture](#data-model--architecture)
5. [Implementation Phases](#implementation-phases)
6. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
7. [Component Library](#component-library)
8. [SEO & Performance Strategy](#seo--performance-strategy)

---

## Project Overview

### Goal
Transform our service pages from simple listings into rich, engaging landing pages that educate users and drive conversions—similar to Vakilsearch's approach.

### Key Features
- **Rich Landing Pages**: Each service gets a dedicated page with packages, process steps, documents, FAQs
- **Engaging UI**: Scroll-triggered animations, interactive elements, modern design
- **Better Conversion**: Multiple CTAs (Get Started, Consult Expert, Download Checklist)
- **SEO Optimized**: Category hubs, inner service pages, location variants
- **Scalable**: Content-driven architecture using Appwrite

---

## Current State vs. Target State

### Before (Current)
```
/services
  └── page.tsx (simple list)
  └── [slug]/page.tsx (basic detail)

Flow: Browse → Click service → Checkout
```

### After (Target)
```
/services
  └── page.tsx (enhanced with categories)
  └── [category]/
      └── page.tsx (category hub)
      └── [slug]/page.tsx (rich landing page)

Flow: Browse category → View rich landing → Get Started/Consult → Checkout
```

### Example URLs
- Category Hub: `/services/company-registration`
- Inner Service: `/services/company-registration/private-limited-company`
- With Location (Phase 2): `/services/company-registration/private-limited-company/mumbai`

---

## UI Libraries & Tech Stack

### Core Stack (Recommended)

#### 1. **Shadcn/UI** (Primary Component Library)
- **Why**: Accessible, customizable, Tailwind-based, you own the code
- **Use For**: Cards, Accordions, Tabs, Dialogs, Badges, Buttons
- **Installation**:
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add accordion card badge tabs button dialog sheet carousel
  ```

#### 2. **Framer Motion** (Animation Library)
- **Why**: Smooth scroll animations, gesture support, layout transitions
- **Use For**: Scroll-triggered animations, page transitions, micro-interactions
- **Installation**:
  ```bash
  npm install framer-motion
  ```

#### 3. **Aceternity UI** (Premium Effects - Selective)
- **Why**: Stunning modern effects for hero sections and standout elements
- **Use For**: Spotlight effects, 3D cards, animated backgrounds, infinite scroll
- **Installation**:
  ```bash
  # Copy specific components from aceternity.com/components
  # We'll selectively use: Spotlight, 3D Card, Infinite Moving Cards, Text Generate Effect
  ```

#### 4. **React Intersection Observer** (Scroll Detection)
- **Why**: Trigger animations when elements enter viewport
- **Installation**:
  ```bash
  npm install react-intersection-observer
  ```

#### 5. **React Countup** (Animated Numbers)
- **Why**: Animate statistics (10L+ companies, 4.5★ rating)
- **Installation**:
  ```bash
  npm install react-countup
  ```

### Additional Utilities
```bash
npm install clsx tailwind-merge  # Utility for className management
npm install sonner               # Toast notifications
npm install lucide-react         # Icon library
```

---

## Data Model & Architecture

### Appwrite Collections

#### 1. **Services Collection** (Enhanced)
```typescript
{
  $id: string
  slug: string                    // "private-limited-company"
  category: string                // "company-registration"
  title: string                   // "Private Limited Company Registration"
  shortDescription: string        // For cards and meta
  price: number                   // Base price
  
  // Hero Section
  heroBadge?: string             // "Only ISO 27001 Certified Platform"
  heroTitle: string              // "Private Limited Company Registration @ ₹999"
  heroHighlights: string[]       // ["Expert filing in 2 days", "Transparent pricing", ...]
  
  // Content Blocks (JSON)
  contentBlocks: {
    // Packages
    packages: [
      {
        name: string             // "Starter", "Standard", "Pro"
        price: number
        originalPrice?: number
        timeline: string         // "21 days"
        popular?: boolean
        inclusions: string[]
        cta: string              // "Get Started"
      }
    ]
    
    // Process Steps
    process: [
      {
        step: number
        title: string
        duration: string
        description: string
        icon?: string
      }
    ]
    
    // Documents Required
    documents: [
      {
        applicantType: string    // "All Directors", "For Company"
        items: string[]
      }
    ]
    
    // Education Content
    education: {
      overview: string           // Rich HTML/Markdown
      eligibility: string[]
      benefits: string[]
      types?: [
        {
          name: string
          description: string
          icon?: string
        }
      ]
    }
    
    // FAQs
    faqs: [
      {
        question: string
        answer: string
      }
    ]
    
    // Social Proof
    socialProof: {
      rating: number             // 4.5
      reviewCount: number        // 19000
      totalServed: number        // 100000
      logos?: string[]           // Brand logos URLs
    }
    
    // Related Services
    relatedServiceIds: string[]
    
    // SEO
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
  
  // Existing Fields (Keep)
  questionForm: {
    title: string
    fields: [...]
  }
  
  // Timestamps
  $createdAt: string
  $updatedAt: string
}
```

#### 2. **Categories Collection** (New)
```typescript
{
  $id: string
  slug: string                    // "company-registration"
  title: string                   // "Company Registration"
  description: string
  icon?: string
  order: number                   // For sorting
  
  // Hub Page Content
  hubContent: {
    hero: {
      title: string
      description: string
      image?: string
    }
    highlights: string[]
    serviceIds: string[]          // References to services
  }
  
  // SEO
  metaTitle?: string
  metaDescription?: string
}
```

#### 3. **Locations Collection** (Phase 2 - Optional)
```typescript
{
  $id: string
  city: string
  state: string
  slug: string                    // "mumbai", "bangalore"
  serviceAvailability: string[]   // Service IDs available in this location
  
  // Local Content
  localContent?: {
    contactNumber?: string
    officeAddress?: string
    localBenefits?: string[]
  }
  
  // SEO
  metaTitle?: string
  metaDescription?: string
}
```

---

## Implementation Phases

### **Phase 1: Foundation** (Week 1)
**Goal**: Set up UI libraries, create basic component structure, implement one service page

#### Tasks:
1. Install and configure Shadcn/UI + Framer Motion
2. Create TypeScript interfaces for content blocks
3. Update Appwrite schema with contentBlocks field
4. Build reusable component library (Hero, Packages, Process, FAQs)
5. Create `/services/[category]/[slug]/page.tsx` route
6. Implement one complete service page (Private Limited Company)
7. Test animations and responsiveness

**Deliverables**:
- ✅ UI libraries configured
- ✅ Component library created
- ✅ One complete service landing page
- ✅ Mobile responsive

---

### **Phase 2: Content & Scale** (Week 2)
**Goal**: Add content for all services, create category hubs, implement CTAs

#### Tasks:
1. Create Categories collection in Appwrite
2. Build category hub page (`/services/[category]/page.tsx`)
3. Populate content for top 5 services:
   - Private Limited Company
   - LLP Registration
   - Trademark Registration
   - GST Registration
   - One Person Company
4. Implement CTA handlers (Get Started → Checkout, Consult → Chat)
5. Add lead capture modals (Download Checklist)
6. Create admin interface for content management (simple form)

**Deliverables**:
- ✅ 5 complete service pages
- ✅ Category hub pages
- ✅ Working CTAs
- ✅ Lead capture system

---

### **Phase 3: Enhancement** (Week 3)
**Goal**: Add premium animations, social proof, optimize performance

#### Tasks:
1. Integrate Aceternity UI components (Spotlight, 3D Cards, Infinite Scroll)
2. Add real-time social proof (recent filings feed)
3. Implement scroll progress indicators
4. Add testimonials/reviews section
5. Optimize images (Next.js Image component)
6. Add loading states and skeleton screens
7. Implement analytics tracking (page views, CTA clicks)

**Deliverables**:
- ✅ Premium animations
- ✅ Social proof elements
- ✅ Optimized performance (Lighthouse score >90)
- ✅ Analytics integration

---

### **Phase 4: SEO & Polish** (Week 4)
**Goal**: SEO optimization, location pages, final polish

#### Tasks:
1. Add structured data (Schema.org: Service, FAQPage, BreadcrumbList)
2. Generate dynamic sitemaps
3. Implement location-specific pages (Mumbai, Delhi, Bangalore)
4. Add breadcrumbs navigation
5. Create "Related Services" section
6. A/B test different CTAs and layouts
7. Final QA and bug fixes

**Deliverables**:
- ✅ SEO optimized (meta tags, schema, sitemaps)
- ✅ Location pages (top 10 cities)
- ✅ Polished UX
- ✅ Production ready

---

## Detailed Step-by-Step Guide

### **Step 1: Install UI Libraries**

```bash
# Navigate to web app directory
cd apps/web

# Install Shadcn/UI
npx shadcn-ui@latest init

# When prompted, choose:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: Yes
# - Components directory: @/components
# - Utils: @/lib/utils
# - React Server Components: Yes

# Install specific components
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add carousel

# Install Framer Motion
npm install framer-motion

# Install additional utilities
npm install react-intersection-observer
npm install react-countup
npm install sonner
npm install lucide-react
npm install clsx tailwind-merge
```

---

### **Step 2: Create TypeScript Interfaces**

**File**: `apps/web/types/service-content.ts`

```typescript
export interface ServicePackage {
  name: string
  price: number
  originalPrice?: number
  discount?: string
  timeline: string
  popular?: boolean
  inclusions: string[]
  cta: string
  emiAvailable?: boolean
}

export interface ProcessStep {
  step: number
  title: string
  duration: string
  description: string
  icon?: string
}

export interface DocumentGroup {
  applicantType: string
  items: string[]
}

export interface ServiceType {
  name: string
  description: string
  icon?: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface SocialProof {
  rating: number
  reviewCount: number
  totalServed: number
  tagline?: string
  logos?: string[]
  recentFilings?: RecentFiling[]
}

export interface RecentFiling {
  brandName: string
  applicantName: string
  city: string
  class?: string
  verified: boolean
}

export interface EducationContent {
  overview: string
  eligibility?: string[]
  benefits?: string[]
  types?: ServiceType[]
  postRegistration?: string
}

export interface ServiceContentBlocks {
  packages: ServicePackage[]
  process: ProcessStep[]
  documents: DocumentGroup[]
  education: EducationContent
  faqs: FAQ[]
  socialProof: SocialProof
  relatedServiceIds?: string[]
}

export interface ServiceHero {
  badge?: string
  title: string
  highlights: string[]
  trustSignals: {
    rating: string
    served: string
    certified?: string
  }
}

export interface ServiceDetail {
  $id: string
  slug: string
  category: string
  title: string
  shortDescription: string
  price: number
  
  hero: ServiceHero
  contentBlocks: ServiceContentBlocks
  
  // Existing
  questionForm?: any
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}
```

---

### **Step 3: Update Appwrite Schema**

**File**: `scripts/setup-appwrite.js` (Add to existing script)

```javascript
// Add to existing services collection setup
async function updateServicesCollection() {
  console.log('Updating services collection...')
  
  const attributes = [
    { key: 'category', type: 'string', size: 100, required: true },
    { key: 'shortDescription', type: 'string', size: 500, required: false },
    { key: 'heroBadge', type: 'string', size: 200, required: false },
    { key: 'heroTitle', type: 'string', size: 300, required: false },
    { key: 'heroHighlights', type: 'string', size: 10000, required: false, array: true },
    { key: 'contentBlocks', type: 'string', size: 100000, required: false }, // JSON
    { key: 'metaTitle', type: 'string', size: 200, required: false },
    { key: 'metaDescription', type: 'string', size: 500, required: false },
    { key: 'keywords', type: 'string', size: 5000, required: false, array: true },
  ]
  
  for (const attr of attributes) {
    try {
      if (attr.array) {
        await databases.createStringAttribute(
          databaseId,
          'services',
          attr.key,
          attr.size,
          attr.required,
          undefined,
          attr.array
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          'services',
          attr.key,
          attr.size,
          attr.required
        )
      }
      console.log(`✓ Added ${attr.key}`)
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠ ${attr.key} already exists`)
      } else {
        console.error(`✗ Error adding ${attr.key}:`, error.message)
      }
    }
  }
}

// Create categories collection
async function createCategoriesCollection() {
  console.log('Creating categories collection...')
  
  try {
    await databases.createCollection(
      databaseId,
      'categories',
      'Categories',
      [
        Permission.read(Role.any()),
        Permission.write(Role.team('admin')),
        Permission.write(Role.team('operations'))
      ]
    )
    
    const attributes = [
      { key: 'slug', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'icon', type: 'string', size: 200, required: false },
      { key: 'order', type: 'integer', required: true, min: 0, max: 1000 },
      { key: 'hubContent', type: 'string', size: 50000, required: false }, // JSON
      { key: 'metaTitle', type: 'string', size: 200, required: false },
      { key: 'metaDescription', type: 'string', size: 500, required: false },
    ]
    
    for (const attr of attributes) {
      if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          'categories',
          attr.key,
          attr.required,
          attr.min,
          attr.max
        )
      } else {
        await databases.createStringAttribute(
          databaseId,
          'categories',
          attr.key,
          attr.size,
          attr.required
        )
      }
      console.log(`✓ Added ${attr.key} to categories`)
    }
    
    // Create index on slug
    await databases.createIndex(
      databaseId,
      'categories',
      'slug_index',
      'key',
      ['slug'],
      ['ASC']
    )
    
    console.log('✓ Categories collection created')
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠ Categories collection already exists')
    } else {
      console.error('✗ Error creating categories:', error.message)
    }
  }
}

// Run updates
await updateServicesCollection()
await createCategoriesCollection()
```

**Run the script**:
```bash
cd scripts
node setup-appwrite.js
```

---

### **Step 4: Create Component Library**

#### **4.1 Hero Section Component**

**File**: `apps/web/components/services/HeroSection.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star } from 'lucide-react'
import { ServiceHero } from '@/types/service-content'

interface HeroSectionProps {
  hero: ServiceHero
  onGetStarted: () => void
  onConsult: () => void
}

export function HeroSection({ hero, onGetStarted, onConsult }: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:50px_50px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            {hero.badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <Badge className="bg-blue-500/20 text-white border-blue-400 mb-6">
                  {hero.badge}
                </Badge>
              </motion.div>
            )}
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {hero.title}
            </motion.h1>
            
            {/* Highlights */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8"
            >
              {hero.highlights.map((highlight, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-lg">{highlight}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8"
              >
                Get Started Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onConsult}
                className="border-white text-white hover:bg-white/10"
              >
                Consult Expert
              </Button>
            </motion.div>
            
            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-6 mt-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{hero.trustSignals.rating}</span>
              </div>
              <div className="border-l border-white/30 pl-6">
                <span className="font-semibold">{hero.trustSignals.served}</span>
              </div>
              {hero.trustSignals.certified && (
                <div className="border-l border-white/30 pl-6">
                  <span>{hero.trustSignals.certified}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
          
          {/* Right side - Image or video placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full h-96 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              {/* Placeholder for image/video */}
              <p className="text-white/50">Service Illustration</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Floating trust badge */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
      >
        <p className="text-sm text-white">
          Trusted by <span className="font-bold">10,000+</span> businesses
        </p>
      </motion.div>
    </section>
  )
}
```

#### **4.2 Packages Section Component**

**File**: `apps/web/components/services/PackagesSection.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles } from 'lucide-react'
import { ServicePackage } from '@/types/service-content'
import { useState } from 'react'

interface PackagesSectionProps {
  packages: ServicePackage[]
  onSelectPackage: (pkg: ServicePackage) => void
}

export function PackagesSection({ packages, onSelectPackage }: PackagesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Right Plan for Your Business</h2>
          <p className="text-gray-600 text-lg">
            Choose the package that best fits your needs
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Card
                className={`relative p-8 h-full transition-all duration-300 ${
                  pkg.popular
                    ? 'ring-2 ring-blue-500 shadow-2xl'
                    : 'hover:shadow-xl'
                } ${
                  hoveredIndex === index ? 'scale-105' : ''
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -right-4"
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 shadow-lg">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                
                {/* Package name */}
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{pkg.timeline}</p>
                
                {/* Pricing */}
                <div className="mb-6">
                  {pkg.discount && (
                    <Badge variant="secondary" className="mb-2">
                      {pkg.discount}
                    </Badge>
                  )}
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">
                      ₹{pkg.price.toLocaleString()}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{pkg.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">+ Govt. Fee</p>
                  
                  {pkg.emiAvailable && (
                    <Badge variant="outline" className="mt-2">
                      EMI Available
                    </Badge>
                  )}
                </div>
                
                {/* Inclusions */}
                <ul className="space-y-3 mb-8">
                  {pkg.inclusions.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  {pkg.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Guarantee note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>💯 100% Money Back Guarantee if not satisfied</p>
        </motion.div>
      </div>
    </section>
  )
}
```

#### **4.3 Process Steps Component**

**File**: `apps/web/components/services/ProcessSteps.tsx`

```typescript
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ProcessStep } from '@/types/service-content'
import { useRef } from 'react'

interface ProcessStepsProps {
  steps: ProcessStep[]
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })
  
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  
  return (
    <section ref={containerRef} className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">
            Simple, transparent process from start to finish
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-blue-600"
            />
          </div>
          
          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 ml-16 md:ml-0">
                  <div className="flex items-start gap-4">
                    {/* Step number - visible on mobile */}
                    <div className="md:hidden">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                      >
                        {step.step}
                      </motion.div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <Badge variant="secondary">⏱️ {step.duration}</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Step number - desktop */}
                <div className="hidden md:flex items-center justify-center w-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg relative z-10"
                  >
                    {step.step}
                  </motion.div>
                </div>
                
                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### **4.4 Documents Checklist Component**

**File**: `apps/web/components/services/DocumentsChecklist.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, CheckSquare } from 'lucide-react'
import { DocumentGroup } from '@/types/service-content'

interface DocumentsChecklistProps {
  documents: DocumentGroup[]
}

export function DocumentsChecklist({ documents }: DocumentsChecklistProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Documents Required</h2>
          <p className="text-gray-600 text-lg">
            Here's what you'll need to get started
          </p>
        </motion.div>
        
        {documents.length === 1 ? (
          // Single group - no tabs
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                {documents[0].applicantType}
              </h3>
              
              <ul className="grid md:grid-cols-2 gap-4">
                {documents[0].items.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ) : (
          // Multiple groups - with tabs
          <Tabs defaultValue={documents[0].applicantType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {documents.map((group) => (
                <TabsTrigger key={group.applicantType} value={group.applicantType}>
                  {group.applicantType}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {documents.map((group) => (
              <TabsContent key={group.applicantType} value={group.applicantType}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-8">
                    <ul className="grid md:grid-cols-2 gap-4">
                      {group.items.map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </section>
  )
}
```

#### **4.5 FAQ Section Component**

**File**: `apps/web/components/services/FAQSection.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQ } from '@/types/service-content'

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about the service
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 rounded-lg px-6 border-none"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        
        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="text-blue-600 font-semibold hover:underline">
            Talk to an Expert →
          </button>
        </motion.div>
      </div>
    </section>
  )
}
```

---

### **Step 5: Create Service Landing Page**

**File**: `apps/web/app/services/[category]/[slug]/page.tsx`

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { databases } from '@lawethic/appwrite/server'
import { appwriteConfig } from '@lawethic/appwrite/config'
import { Query } from 'node-appwrite'
import { ServiceDetail } from '@/types/service-content'

// Components
import { HeroSection } from '@/components/services/HeroSection'
import { PackagesSection } from '@/components/services/PackagesSection'
import { ProcessSteps } from '@/components/services/ProcessSteps'
import { DocumentsChecklist } from '@/components/services/DocumentsChecklist'
import { FAQSection } from '@/components/services/FAQSection'
import { ServicePageClient } from './ServicePageClient'

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

async function getService(slug: string): Promise<ServiceDetail | null> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.services,
      [Query.equal('slug', slug), Query.limit(1)]
    )

    if (response.documents.length === 0) {
      return null
    }

    const doc = response.documents[0]
    
    // Parse contentBlocks JSON
    const contentBlocks = doc.contentBlocks 
      ? JSON.parse(doc.contentBlocks)
      : null

    return {
      ...doc,
      contentBlocks,
    } as ServiceDetail
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const service = await getService(params.slug)

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  return {
    title: service.metaTitle || `${service.title} | LawEthic`,
    description: service.metaDescription || service.shortDescription,
    keywords: service.keywords,
    openGraph: {
      title: service.metaTitle || service.title,
      description: service.metaDescription || service.shortDescription,
      type: 'website',
    },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const service = await getService(params.slug)

  if (!service || !service.contentBlocks) {
    notFound()
  }

  return (
    <ServicePageClient service={service} />
  )
}
```

**File**: `apps/web/app/services/[category]/[slug]/ServicePageClient.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { ServiceDetail } from '@/types/service-content'
import { HeroSection } from '@/components/services/HeroSection'
import { PackagesSection } from '@/components/services/PackagesSection'
import { ProcessSteps } from '@/components/services/ProcessSteps'
import { DocumentsChecklist } from '@/components/services/DocumentsChecklist'
import { FAQSection } from '@/components/services/FAQSection'

interface ServicePageClientProps {
  service: ServiceDetail
}

export function ServicePageClient({ service }: ServicePageClientProps) {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push(`/checkout?serviceId=${service.$id}`)
  }

  const handleConsult = () => {
    // Open chat or schedule consultation
    // For now, scroll to contact or open chat
    alert('Opening consultation chat...')
  }

  const handleSelectPackage = (pkg: any) => {
    router.push(`/checkout?serviceId=${service.$id}&package=${pkg.name}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection
        hero={service.hero}
        onGetStarted={handleGetStarted}
        onConsult={handleConsult}
      />

      {/* Packages */}
      <PackagesSection
        packages={service.contentBlocks.packages}
        onSelectPackage={handleSelectPackage}
      />

      {/* Process */}
      <ProcessSteps steps={service.contentBlocks.process} />

      {/* Documents */}
      <DocumentsChecklist documents={service.contentBlocks.documents} />

      {/* FAQs */}
      <FAQSection faqs={service.contentBlocks.faqs} />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 md:hidden">
        <button
          onClick={handleGetStarted}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Get Started Now
        </button>
      </div>
    </div>
  )
}
```

---

### **Step 6: Seed Sample Service Data**

**File**: `scripts/seed-service-content.js`

```javascript
const { Client, Databases, ID } = require('node-appwrite')

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

const privateLtdService = {
  slug: 'private-limited-company',
  category: 'company-registration',
  title: 'Private Limited Company Registration',
  shortDescription: 'Register your Private Limited Company in India with expert assistance. Get incorporation certificate in 14-21 days.',
  price: 999,
  
  heroBadge: 'Only ISO 27001 Certified Platform',
  heroTitle: 'Private Limited Company Registration @ ₹999',
  heroHighlights: [
    'Expert filing in 2 days',
    'Transparent pricing starting at ₹999 + Govt Fee',
    'Complete compliance handling',
    'Incorporation in 14-21 days'
  ],
  
  contentBlocks: JSON.stringify({
    packages: [
      {
        name: 'Starter',
        price: 999,
        originalPrice: 1499,
        discount: '₹500 off',
        timeline: '21 days',
        popular: false,
        inclusions: [
          'Company name filed in 4-7 days',
          'DSC for 2 Directors in 7-10 days',
          'SPICe+ form filing in 21 days',
          'Incorporation Certificate in 40 days',
          'Company PAN+TAN',
          'DIN for Directors'
        ],
        cta: 'Get Started'
      },
      {
        name: 'Standard',
        price: 1499,
        originalPrice: 2999,
        discount: '50% off',
        timeline: '14-21 days',
        popular: true,
        inclusions: [
          'Expert assisted process',
          'Company name filed in 2-3 days',
          'DSC for 2 Directors in 3-4 days',
          'SPICe+ form filing in 10 days',
          'Incorporation Certificate in 14-21 days',
          'Company PAN+TAN',
          'DIN for directors',
          'Welcome Kit with Compliance Checklist'
        ],
        cta: 'Get Started',
        emiAvailable: false
      },
      {
        name: 'Pro',
        price: 3499,
        originalPrice: 4999,
        discount: '30% off',
        timeline: '8-14 days',
        popular: false,
        inclusions: [
          'Expert-assisted process',
          'Company name filed in 0-1 day',
          'DSC for 2 Directors in 1-2 days',
          'SPICe+ form filing in 5 days',
          'Incorporation Certificate in 8-14 days',
          'Company PAN+TAN',
          'DIN for Directors',
          'Welcome Kit with Compliance Checklist',
          'Quick Trademark Filing in 1 day',
          'MSME registration Free'
        ],
        cta: 'Get Started',
        emiAvailable: true
      }
    ],
    
    process: [
      {
        step: 1,
        title: 'Name Approval',
        duration: '2-3 days',
        description: 'We file your proposed company names with MCA for approval. Choose 3 name options and we handle the rest.'
      },
      {
        step: 2,
        title: 'Digital Signature Certificate',
        duration: '3-4 days',
        description: 'DSC obtained for 2 directors required for signing digital documents with the government.'
      },
      {
        step: 3,
        title: 'SPICe+ Form Filing',
        duration: '10 days',
        description: 'Complete incorporation application submitted to MCA including MOA, AOA, and other required documents.'
      },
      {
        step: 4,
        title: 'Incorporation Certificate',
        duration: '14-21 days',
        description: 'Your company is officially registered! Receive Certificate of Incorporation, PAN, TAN, and DIN.'
      }
    ],
    
    documents: [
      {
        applicantType: 'All Directors',
        items: [
          'PAN Card (mandatory)',
          'Aadhar Card (for identity proof)',
          'Passport-size photograph',
          'Address Proof (utility bill, bank statement, or passport)',
          'Bank statement of last 2 months',
          'Specimen signature'
        ]
      },
      {
        applicantType: 'For Company',
        items: [
          'Registered office address proof',
          'NOC from property owner',
          'Rent agreement (if rented)',
          'Utility bill of registered office',
          'Directors consent letter',
          'Proposed business activities description'
        ]
      }
    ],
    
    education: {
      overview: 'A Private Limited Company is the most popular business structure in India for startups and growing businesses. It offers limited liability protection, separate legal entity status, and easier access to funding.',
      eligibility: [
        'Minimum 2 directors and maximum 200 directors',
        'Minimum 2 shareholders',
        'At least one director must be an Indian resident',
        'No minimum capital requirement',
        'Directors must have DIN (Director Identification Number)'
      ],
      benefits: [
        'Limited liability protection for shareholders',
        'Separate legal entity - company can own property, enter contracts',
        'Easier to raise funds from investors and banks',
        'Perpetual succession - company continues even if shareholders change',
        'Tax benefits and deductions available',
        'Enhanced credibility with customers and vendors',
        'Easy transfer of ownership through share transfer'
      ]
    },
    
    faqs: [
      {
        question: 'How long does Private Limited Company registration take?',
        answer: 'Typically 14-21 days in a straightforward case without objections. With our Pro package, it can be completed in 8-14 days.'
      },
      {
        question: 'What is the minimum capital required?',
        answer: 'There is no minimum capital requirement for Private Limited Companies in India. You can start with as little as ₹1,000.'
      },
      {
        question: 'How many directors are required?',
        answer: 'Minimum 2 directors are required. Maximum limit is 15 directors (can be increased with special resolution). At least one director must be an Indian resident.'
      },
      {
        question: 'What are the annual compliance requirements?',
        answer: 'Private Limited Companies must file annual returns (Form MGT-7), financial statements (Form AOC-4), conduct board meetings, maintain statutory registers, and file income tax returns.'
      },
      {
        question: 'Can foreigners be directors or shareholders?',
        answer: 'Yes, foreigners can be directors and shareholders. However, at least one director must be an Indian resident. Foreign investment may require RBI/FIPB approval in certain sectors.'
      },
      {
        question: 'What is the difference between Private and Public Limited Company?',
        answer: 'Private Limited has minimum 2 and maximum 200 shareholders, cannot raise funds from public. Public Limited can have unlimited shareholders and can raise funds through public issue.'
      },
      {
        question: 'Do I need a physical office to register?',
        answer: 'Yes, you need a registered office address in India. It can be residential or commercial property. We help with virtual office solutions if needed.'
      },
      {
        question: 'What happens if my company name is rejected?',
        answer: "We conduct thorough name search before filing. If still rejected, we'll file your second or third choice at no extra cost."
      }
    ],
    
    socialProof: {
      rating: 4.5,
      reviewCount: 19000,
      totalServed: 100000,
      tagline: "We're registering companies every 5 minutes!"
    }
  }),
  
  metaTitle: 'Private Limited Company Registration Online @ ₹999 | Expert Assistance',
  metaDescription: 'Register your Private Limited Company in India with LawEthic. Expert filing, transparent pricing from ₹999, incorporation in 14-21 days. 100% online process.',
  keywords: ['private limited company', 'company registration', 'pvt ltd registration', 'incorporation', 'startup registration']
}

async function seedService() {
  try {
    console.log('Seeding Private Limited Company service...')
    
    // Check if already exists
    const existing = await databases.listDocuments(
      databaseId,
      'services',
      [Query.equal('slug', privateLtdService.slug)]
    )
    
    if (existing.documents.length > 0) {
      console.log('⚠ Service already exists, updating...')
      await databases.updateDocument(
        databaseId,
        'services',
        existing.documents[0].$id,
        privateLtdService
      )
      console.log('✓ Service updated successfully')
    } else {
      await databases.createDocument(
        databaseId,
        'services',
        ID.unique(),
        privateLtdService
      )
      console.log('✓ Service created successfully')
    }
    
    console.log('\n📝 Service URL: /services/company-registration/private-limited-company')
  } catch (error) {
    console.error('Error seeding service:', error)
  }
}

seedService()
```

**Run the seed script**:
```bash
cd scripts
node seed-service-content.js
```

---

## SEO & Performance Strategy

### 1. **Meta Tags & Open Graph**
- Dynamic meta titles and descriptions per service
- Open Graph images for social sharing
- Twitter cards

### 2. **Structured Data (Schema.org)**
```typescript
// Add to service page
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.shortDescription,
  provider: {
    '@type': 'Organization',
    name: 'LawEthic',
  },
  offers: {
    '@type': 'Offer',
    price: service.price,
    priceCurrency: 'INR',
  },
}
```

### 3. **Performance Optimizations**
- Use Next.js Image component for all images
- Lazy load non-critical animations
- Code splitting for heavy components
- Preload critical fonts
- Implement ISR (Incremental Static Regeneration) for service pages

### 4. **Sitemap Generation**
- Dynamic sitemap including all services and categories
- Submit to Google Search Console

---

## Next Steps

### Week 1 (Foundation)
- [ ] Install UI libraries (Step 1)
- [ ] Create TypeScript interfaces (Step 2)
- [ ] Update Appwrite schema (Step 3)
- [ ] Build component library (Step 4)
- [ ] Create service landing page template (Step 5)
- [ ] Seed one service (Step 6)
- [ ] Test and refine

### Week 2 (Scale)
- [ ] Create categories collection
- [ ] Build category hub pages
- [ ] Seed 5 core services
- [ ] Implement CTA handlers
- [ ] Add lead capture modals
- [ ] Create admin content management interface

### Week 3 (Enhancement)
- [ ] Add Aceternity UI components
- [ ] Implement advanced animations
- [ ] Add social proof elements
- [ ] Optimize performance
- [ ] Add analytics

### Week 4 (Launch)
- [ ] SEO optimization
- [ ] Location pages
- [ ] Final testing
- [ ] Production deployment

---

## Resources

- **Shadcn/UI**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion
- **Aceternity UI**: https://ui.aceternity.com
- **Lucide Icons**: https://lucide.dev
- **Appwrite Docs**: https://appwrite.io/docs

---

**Ready to begin? Start with Week 1, Step 1! 🚀**
