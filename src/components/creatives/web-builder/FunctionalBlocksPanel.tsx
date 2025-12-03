import React from 'react';
import { Calendar, ShoppingCart, CreditCard, MapPin, Image, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface FunctionalBlock {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'booking' | 'ecommerce' | 'media' | 'payment';
  htmlTemplate: string;
}

const functionalBlocks: FunctionalBlock[] = [
  {
    id: 'booking-widget',
    name: 'Booking Widget',
    description: 'Appointment & reservation scheduler',
    icon: <Calendar className="w-5 h-5" />,
    category: 'booking',
    htmlTemplate: `<div data-component="booking-widget" data-service-name="Consultation" data-duration="60" class="p-6 bg-card rounded-lg shadow-md max-w-md mx-auto">
  <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    Book Consultation
  </h3>
  <p class="text-muted-foreground mb-4">Select a date and time for your appointment</p>
  <button class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:opacity-90">Book Now</button>
</div>`
  },
  {
    id: 'product-card',
    name: 'Product Card',
    description: 'E-commerce product with add to cart',
    icon: <Package className="w-5 h-5" />,
    category: 'ecommerce',
    htmlTemplate: `<div data-component="product-card" data-product-id="" class="bg-card rounded-lg overflow-hidden shadow-md max-w-sm">
  <div class="aspect-square bg-muted flex items-center justify-center">
    <span class="text-muted-foreground">Product Image</span>
  </div>
  <div class="p-4">
    <h3 class="font-semibold text-lg">Product Name</h3>
    <p class="text-sm text-muted-foreground mt-1">Product description goes here</p>
    <div class="flex items-center justify-between mt-4">
      <span class="text-xl font-bold text-primary">$99.99</span>
      <button class="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90">Add to Cart</button>
    </div>
  </div>
</div>`
  },
  {
    id: 'shopping-cart',
    name: 'Shopping Cart',
    description: 'Full cart with checkout flow',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'ecommerce',
    htmlTemplate: `<div data-component="shopping-cart" class="inline-block">
  <button class="relative p-2 border rounded-md hover:bg-accent">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">0</span>
  </button>
</div>`
  },
  {
    id: 'payment-button',
    name: 'Payment Button',
    description: 'One-click payment with form',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'payment',
    htmlTemplate: `<div data-component="payment-button" data-amount="99.99" data-product="Product Name" class="inline-block">
  <button class="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold flex items-center gap-2 hover:opacity-90">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    Pay $99.99
  </button>
</div>`
  },
  {
    id: 'openstreetmap',
    name: 'Location Map',
    description: 'Interactive OpenStreetMap embed',
    icon: <MapPin className="w-5 h-5" />,
    category: 'media',
    htmlTemplate: `<div data-component="openstreetmap" data-lat="40.7128" data-lng="-74.0060" data-address="" data-title="Our Location" class="rounded-lg overflow-hidden border" style="height: 300px;">
  <iframe 
    src="https://www.openstreetmap.org/export/embed.html?bbox=-74.02,40.70,-73.99,40.72&layer=mapnik&marker=40.7128,-74.0060" 
    class="w-full h-full border-0" 
    loading="lazy"
    title="Location Map">
  </iframe>
</div>`
  },
  {
    id: 'image-placeholder',
    name: 'AI Image',
    description: 'Generate image with AI prompt',
    icon: <Image className="w-5 h-5" />,
    category: 'media',
    htmlTemplate: `<div data-component="ai-image" data-prompt="" class="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
  <div class="text-center p-4">
    <svg class="w-10 h-10 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    <p class="text-sm text-muted-foreground">Click to generate AI image</p>
  </div>
</div>`
  }
];

interface FunctionalBlocksPanelProps {
  onInsertBlock: (html: string) => void;
}

export const FunctionalBlocksPanel: React.FC<FunctionalBlocksPanelProps> = ({ onInsertBlock }) => {
  const categories = [
    { id: 'booking', label: 'Booking & Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'ecommerce', label: 'E-Commerce', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'payment', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'media', label: 'Media & Maps', icon: <Image className="w-4 h-4" /> }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="font-semibold text-sm mb-2">Functional Elements</h3>
          <p className="text-xs text-muted-foreground">
            Add interactive components with real functionality
          </p>
        </div>

        {categories.map(category => {
          const categoryBlocks = functionalBlocks.filter(b => b.category === category.id);
          if (categoryBlocks.length === 0) return null;

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                {category.icon}
                {category.label}
              </div>
              <div className="grid gap-2">
                {categoryBlocks.map(block => (
                  <Card 
                    key={block.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onInsertBlock(block.htmlTemplate)}
                  >
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {block.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{block.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {block.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          );
        })}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Pro Tip</p>
          <p>
            These components are powered by AI automation. When published, they connect to your CRM and handle real bookings, payments, and orders.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};
