import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Award, Heart, Sparkles, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Crafting timeless elegance since 2026, CaddyComfort brings you curated luxury fashion that celebrates individuality and sophistication.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                alt="Our Store"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-serif mb-6">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                At CaddyComfort, we believe that fashion is more than just clothing—it&apos;s an expression of who you are. Our mission is to provide discerning customers with access to the finest luxury fashion pieces that blend timeless elegance with contemporary style.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every item in our collection is carefully selected for its quality, craftsmanship, and ability to transcend trends. We&apos;re committed to sustainability, ethical sourcing, and creating a shopping experience that&apos;s as exceptional as the pieces we offer.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-24">
            <h2 className="text-4xl font-serif text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Award, title: 'Quality First', description: 'Only the finest materials and craftsmanship make it into our collection.' },
                { icon: Heart, title: 'Customer Care', description: 'Your satisfaction is our priority, with personalized service every step of the way.' },
                { icon: Sparkles, title: 'Timeless Style', description: 'We curate pieces that remain elegant and relevant season after season.' },
                { icon: Users, title: 'Community', description: 'Building a community of fashion enthusiasts who appreciate true luxury.' },
              ].map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="text-center">
                    <div className="h-16 w-16 rounded-full bg-accent-rose-subtle mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-accent-rose" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="text-center">
            <h2 className="text-4xl font-serif mb-6">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Our passionate team of fashion experts is dedicated to bringing you the best in luxury fashion, with decades of combined experience in the industry.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
