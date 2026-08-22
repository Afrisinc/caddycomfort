'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Heart } from 'lucide-react';

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 py-20">
          <h1 className="text-gradient-rose">
            CaddyComfort
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Timeless elegance meets contemporary style
          </p>
        </section>

        {/* Buttons Showcase */}
        <section className="space-y-8">
          <h2>Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
          </div>
        </section>

        {/* Cards Showcase */}
        <section className="space-y-8">
          <h2>Card Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <div className="h-48 bg-muted rounded-card"></div>
              <h3 className="text-2xl">Product Name</h3>
              <p className="text-muted-foreground">
                Elegant description of the luxury fashion item
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-serif text-accent-rose">Rwf 299,000</span>
                <Button size="sm">Add to Cart</Button>
              </div>
            </Card>
            
            <Card className="p-6 space-y-4 shadow-luxury">
              <div className="h-48 bg-gradient-to-br from-accent-rose-subtle to-accent-rose-muted rounded-card"></div>
              <h3 className="text-2xl">Featured Item</h3>
              <p className="text-muted-foreground">
                Premium collection piece with luxury finish
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-serif text-accent-rose-vibrant">Rwf 499,000</span>
                <Button className="bg-accent-rose hover:bg-accent-rose-dark">Shop Now</Button>
              </div>
            </Card>
            
            <Card className="p-6 space-y-4 border-accent-rose">
              <div className="h-48 bg-muted rounded-card"></div>
              <h3 className="text-2xl">New Arrival</h3>
              <p className="text-muted-foreground">
                Fresh from the runway, limited edition
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-serif text-accent-rose">Rwf 399,000</span>
                <Button variant="outline">View Details</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Input Showcase */}
        <section className="space-y-8">
          <h2>Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search..." />
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="space-y-8">
          <h2>Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-card" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-8">
          <h2>Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose rounded-card"></div>
              <p className="text-sm font-medium">Rose</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose-light rounded-card"></div>
              <p className="text-sm font-medium">Rose Light</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose-dark rounded-card"></div>
              <p className="text-sm font-medium">Rose Dark</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose-muted rounded-card"></div>
              <p className="text-sm font-medium">Rose Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose-vibrant rounded-card"></div>
              <p className="text-sm font-medium">Rose Vibrant</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent-rose-subtle rounded-card"></div>
              <p className="text-sm font-medium">Rose Subtle</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <h2>Typography Scale</h2>
          <div className="space-y-4">
            <h1>Heading 1 - Display</h1>
            <h2>Heading 2 - Large Title</h2>
            <h3>Heading 3 - Title</h3>
            <h4>Heading 4 - Subtitle</h4>
            <h5>Heading 5 - Small Title</h5>
            <h6>Heading 6 - Caption</h6>
            <p className="text-lg">Large body text for emphasis and readability</p>
            <p>Regular body text using Inter font family for optimal reading</p>
            <p className="text-sm text-muted-foreground">Small supporting text in muted color</p>
          </div>
        </section>

      </div>
    </div>
  );
}
