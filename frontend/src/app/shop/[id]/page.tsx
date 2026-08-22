'use client';

import { useState, use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  Star,
  StarHalf,
  Minus,
  Plus,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Realistic product data based on ID
  interface ProductData {
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    rating: number;
    reviewCount: number;
    category: string;
    brand: string;
    description: string;
    features: string[];
    images: string[];
    sizes: string[];
    colors: Array<{ name: string; hex: string }>;
  }

  const getProductData = (productId: string): ProductData => {
    const productDatabase: Record<string, ProductData> = {
      // Bags
      'bag-1': {
        name: 'Elegant Leather Handbag',
        price: 159000,
        originalPrice: 199000,
        discount: 20,
        rating: 4.7,
        reviewCount: 89,
        category: 'Handbag',
        brand: 'CaddyComfort',
        description: 'Crafted from premium genuine leather, this elegant handbag combines sophisticated design with practical functionality. Features a spacious interior with multiple compartments, adjustable shoulder strap, and elegant gold-tone hardware. Perfect for both day and evening wear.',
        features: [
          '100% Genuine Leather',
          'Adjustable shoulder strap',
          'Multiple interior compartments',
          'Gold-tone hardware',
          'Spacious main compartment',
          'Interior zip pocket',
        ],
        images: [
          '/new-images/bag/bag-1.jpg',
          '/new-images/bag/bag-2.jpg',
          '/new-images/bag/bag-3.jpg',
        ],
        sizes: ['One Size'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Brown', hex: '#8B4513' },
          { name: 'Burgundy', hex: '#800020' },
        ],
      },
      'bag-2': {
        name: 'Designer Tote Bag',
        price: 179000,
        originalPrice: 229000,
        discount: 22,
        rating: 4.6,
        reviewCount: 124,
        category: 'Handbag',
        brand: 'CaddyComfort',
        description: 'A spacious and stylish tote bag perfect for everyday use. Made from high-quality faux leather with reinforced handles, this bag offers ample space for all your essentials while maintaining a chic, modern aesthetic.',
        features: [
          'Premium Faux Leather',
          'Reinforced handles',
          'Large main compartment',
          'Interior pockets',
          'Stylish design',
          'Durable construction',
        ],
        images: [
          '/new-images/bag/bag-2.jpg',
          '/new-images/bag/bag-1.jpg',
          '/new-images/bag/bag-4.jpg',
        ],
        sizes: ['One Size'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Beige', hex: '#F5F5DC' },
          { name: 'Navy', hex: '#000080' },
        ],
      },
      // Dresses
      'dress-1': {
        name: 'Elegant Evening Gown',
        price: 249000,
        originalPrice: 329000,
        discount: 24,
        rating: 4.8,
        reviewCount: 156,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'A stunning evening gown designed for special occasions. Featuring elegant draping, luxurious fabric, and a flattering silhouette that enhances your natural curves. Perfect for weddings, galas, and formal events.',
        features: [
          'Premium Quality Fabric',
          'Elegant draping',
          'Flattering silhouette',
          'Hidden back zipper',
          'Lining included',
          'Dry clean recommended',
        ],
        images: [
          '/new-images/dress/dress-1.jpg',
          '/new-images/dress/dress-2.jpg',
          '/new-images/dress/dress-3.jpg',
          '/new-images/dress/dress-4.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Navy', hex: '#000080' },
          { name: 'Burgundy', hex: '#800020' },
          { name: 'Black', hex: '#000000' },
          { name: 'Emerald', hex: '#50C878' },
        ],
      },
      'dress-2': {
        name: 'Classic A-Line Dress',
        price: 189000,
        originalPrice: 249000,
        discount: 24,
        rating: 4.5,
        reviewCount: 203,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'A timeless A-line dress that never goes out of style. Versatile enough for office wear or casual outings, this dress features a comfortable fit, classic design, and high-quality fabric that moves beautifully.',
        features: [
          'Classic A-line silhouette',
          'Comfortable fit',
          'Versatile design',
          'Machine washable',
          'Breathable fabric',
          'Timeless style',
        ],
        images: [
          '/new-images/dress/dress-2.jpg',
          '/new-images/dress/dress-5.jpg',
          '/new-images/dress/dress-6.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Navy', hex: '#000080' },
          { name: 'Red', hex: '#DC2626' },
          { name: 'Ivory', hex: '#FFFFF0' },
        ],
      },
      // Shoes
      'shoe-1': {
        name: 'Premium Leather Heels',
        price: 189000,
        originalPrice: 249000,
        discount: 24,
        rating: 4.6,
        reviewCount: 187,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Step into elegance with these premium leather heels. Crafted from genuine leather with a comfortable heel height and cushioned insole, these shoes combine style and comfort perfectly. Perfect for both work and special occasions.',
        features: [
          '100% Genuine Leather',
          'Comfortable heel height',
          'Cushioned insole',
          'Non-slip sole',
          'Elegant design',
          'Durable construction',
        ],
        images: [
          '/new-images/Shoes/shoe-1.jpg',
          '/new-images/Shoes/shoe-2.jpg',
          '/new-images/Shoes/shoe-3.jpg',
        ],
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Nude', hex: '#E3BC9A' },
          { name: 'Red', hex: '#DC2626' },
          { name: 'Navy', hex: '#000080' },
        ],
      },
      'shoe-2': {
        name: 'Designer High Heels',
        price: 219000,
        originalPrice: 289000,
        discount: 24,
        rating: 4.7,
        reviewCount: 142,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Make a statement with these stunning designer high heels. Featuring a bold design, premium materials, and exceptional craftsmanship. These heels are designed to turn heads while providing all-day comfort.',
        features: [
          'Premium materials',
          'Exceptional craftsmanship',
          'Bold design',
          'Comfortable fit',
          'Quality sole',
          'Stylish appeal',
        ],
        images: [
          '/new-images/Shoes/shoe-2.jpg',
          '/new-images/Shoes/shoe-4.jpg',
          '/new-images/Shoes/shoe-5.jpg',
        ],
        sizes: ['36', '37', '38', '39', '40'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Gold', hex: '#FFD700' },
          { name: 'Silver', hex: '#C0C0C0' },
        ],
      },
      // Wigs
      'wig-1': {
        name: 'Premium Human Hair Wig',
        price: 349000,
        originalPrice: 449000,
        discount: 22,
        rating: 4.9,
        reviewCount: 98,
        category: 'Wigs',
        brand: 'CaddyComfort',
        description: 'Experience the ultimate in wig luxury with our premium human hair collection. Made from 100% human hair, this wig offers natural movement, versatility, and can be styled, colored, and heat-treated just like your own hair.',
        features: [
          '100% Human Hair',
          'Natural look and feel',
          'Heat-stylable',
          'Can be colored',
          'Natural movement',
          'Long-lasting quality',
        ],
        images: [
          '/new-images/wigs/wig-1.jpg',
          '/new-images/wigs/wig-2.jpg',
        ],
        sizes: ['One Size (Adjustable)'],
        colors: [
          { name: 'Natural Black', hex: '#1C1C1C' },
          { name: 'Dark Brown', hex: '#3D2817' },
          { name: 'Light Brown', hex: '#8B6914' },
          { name: 'Blonde', hex: '#F5DEB3' },
        ],
      },
      'wig-2': {
        name: 'Luxury Synthetic Wig',
        price: 229000,
        originalPrice: 299000,
        discount: 23,
        rating: 4.4,
        reviewCount: 167,
        category: 'Wigs',
        brand: 'CaddyComfort',
        description: 'A high-quality synthetic wig that offers excellent value without compromising on style. Pre-styled and ready to wear, this wig maintains its shape beautifully and requires minimal maintenance.',
        features: [
          'Premium synthetic fibers',
          'Pre-styled',
          'Low maintenance',
          'Natural appearance',
          'Lightweight',
          'Durable',
        ],
        images: [
          '/new-images/wigs/wig-2.jpg',
          '/new-images/wigs/wig-1.jpg',
        ],
        sizes: ['One Size (Adjustable)'],
        colors: [
          { name: 'Natural Black', hex: '#1C1C1C' },
          { name: 'Brown', hex: '#654321' },
          { name: 'Auburn', hex: '#A52A2A' },
        ],
      },
      // More bag products
      'bag-3': {
        name: 'Luxury Crossbody Bag',
        price: 139000,
        originalPrice: 179000,
        discount: 22,
        rating: 4.5,
        reviewCount: 112,
        category: 'Handbag',
        brand: 'CaddyComfort',
        description: 'A stylish and practical crossbody bag perfect for hands-free convenience. Features a comfortable adjustable strap, secure closure, and compact design that holds all your essentials.',
        features: [
          'Adjustable crossbody strap',
          'Secure closure',
          'Compact design',
          'Multiple pockets',
          'Lightweight',
          'Durable material',
        ],
        images: [
          '/new-images/bag/bag-3.jpg',
          '/new-images/bag/bag-4.jpg',
          '/new-images/bag/bag-5.jpg',
        ],
        sizes: ['One Size'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Brown', hex: '#8B4513' },
          { name: 'Tan', hex: '#D2B48C' },
        ],
      },
      'bag-4': {
        name: 'Premium Shoulder Bag',
        price: 169000,
        originalPrice: 219000,
        discount: 23,
        rating: 4.6,
        reviewCount: 95,
        category: 'Handbag',
        brand: 'CaddyComfort',
        description: 'A versatile shoulder bag that seamlessly transitions from day to night. Made from premium materials with elegant detailing and practical organization features.',
        features: [
          'Premium materials',
          'Shoulder strap included',
          'Interior organization',
          'Elegant design',
          'Versatile styling',
          'Quality craftsmanship',
        ],
        images: [
          '/new-images/bag/bag-4.jpg',
          '/new-images/bag/bag-1.jpg',
          '/new-images/bag/bag-2.jpg',
        ],
        sizes: ['One Size'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Navy', hex: '#000080' },
          { name: 'Burgundy', hex: '#800020' },
        ],
      },
      'bag-5': {
        name: 'Stylish Clutch Bag',
        price: 119000,
        originalPrice: 149000,
        discount: 20,
        rating: 4.4,
        reviewCount: 78,
        category: 'Handbag',
        brand: 'CaddyComfort',
        description: 'An elegant clutch bag perfect for evening events and special occasions. Compact yet spacious enough for essentials, with sophisticated styling and premium finish.',
        features: [
          'Compact design',
          'Elegant styling',
          'Premium finish',
          'Secure closure',
          'Perfect for evening',
          'Space for essentials',
        ],
        images: [
          '/new-images/bag/bag-5.jpg',
          '/new-images/bag/bag-1.jpg',
          '/new-images/bag/bag-3.jpg',
        ],
        sizes: ['One Size'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Gold', hex: '#FFD700' },
          { name: 'Silver', hex: '#C0C0C0' },
        ],
      },
      // More dress products
      'dress-3': {
        name: 'Designer Cocktail Dress',
        price: 279000,
        originalPrice: 359000,
        discount: 22,
        rating: 4.8,
        reviewCount: 134,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'A stunning cocktail dress designed to make you stand out at any event. Featuring elegant details, flattering fit, and luxurious fabric that moves beautifully.',
        features: [
          'Luxurious fabric',
          'Flattering fit',
          'Elegant details',
          'Perfect for parties',
          'High-quality construction',
          'Dry clean only',
        ],
        images: [
          '/new-images/dress/dress-3.jpg',
          '/new-images/dress/dress-4.jpg',
          '/new-images/dress/dress-5.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Red', hex: '#DC2626' },
          { name: 'Navy', hex: '#000080' },
        ],
      },
      'dress-4': {
        name: 'Elegant Maxi Dress',
        price: 219000,
        originalPrice: 289000,
        discount: 24,
        rating: 4.7,
        reviewCount: 178,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'Flow effortlessly in this elegant maxi dress. Perfect for summer events, beach weddings, or casual outings. Features a comfortable fit and beautiful drape.',
        features: [
          'Flowing maxi length',
          'Comfortable fit',
          'Beautiful drape',
          'Breathable fabric',
          'Versatile styling',
          'Easy care',
        ],
        images: [
          '/new-images/dress/dress-4.jpg',
          '/new-images/dress/dress-6.jpg',
          '/new-images/dress/dress-7.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Floral Print', hex: '#FFB6C1' },
          { name: 'Navy', hex: '#000080' },
          { name: 'Black', hex: '#000000' },
        ],
      },
      'dress-5': {
        name: 'Chic Midi Dress',
        price: 199000,
        originalPrice: 259000,
        discount: 23,
        rating: 4.6,
        reviewCount: 145,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'A versatile midi dress that works for both casual and semi-formal occasions. Modern design with classic appeal, perfect for any wardrobe.',
        features: [
          'Versatile midi length',
          'Modern design',
          'Classic appeal',
          'Comfortable fabric',
          'Easy to style',
          'Machine washable',
        ],
        images: [
          '/new-images/dress/dress-5.jpg',
          '/new-images/dress/dress-8.jpg',
          '/new-images/dress/dress-9.jpg',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Blue', hex: '#2563EB' },
          { name: 'Pink', hex: '#EC4899' },
        ],
      },
      // More shoe products
      'shoe-3': {
        name: 'Elegant Stiletto Heels',
        price: 199000,
        originalPrice: 259000,
        discount: 23,
        rating: 4.5,
        reviewCount: 163,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Classic stiletto heels that never go out of style. These elegant shoes feature a pointed toe, high heel, and premium materials for a sophisticated look.',
        features: [
          'Classic stiletto design',
          'Pointed toe',
          'High heel',
          'Premium materials',
          'Comfortable fit',
          'Timeless elegance',
        ],
        images: [
          '/new-images/Shoes/shoe-3.jpg',
          '/new-images/Shoes/shoe-6.jpg',
          '/new-images/Shoes/shoe-7.jpg',
        ],
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Nude', hex: '#E3BC9A' },
          { name: 'Red', hex: '#DC2626' },
        ],
      },
      'shoe-4': {
        name: 'Luxury Platform Heels',
        price: 229000,
        originalPrice: 299000,
        discount: 23,
        rating: 4.7,
        reviewCount: 129,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Make a bold statement with these luxury platform heels. Featuring a chunky platform sole and high heel for added height and dramatic impact.',
        features: [
          'Platform sole',
          'High heel',
          'Bold design',
          'Sturdy construction',
          'Comfortable platform',
          'Statement piece',
        ],
        images: [
          '/new-images/Shoes/shoe-4.jpg',
          '/new-images/Shoes/shoe-8.jpg',
          '/new-images/Shoes/shoe-9.jpg',
        ],
        sizes: ['36', '37', '38', '39', '40'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'White', hex: '#FFFFFF' },
          { name: 'Metallic', hex: '#C0C0C0' },
        ],
      },
      'shoe-5': {
        name: 'Chic Ankle Boots',
        price: 249000,
        originalPrice: 329000,
        discount: 24,
        rating: 4.6,
        reviewCount: 198,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Stylish ankle boots perfect for cooler seasons. These chic boots combine fashion-forward design with comfort and durability.',
        features: [
          'Ankle height',
          'Stylish design',
          'Durable construction',
          'Comfortable fit',
          'Versatile styling',
          'Quality materials',
        ],
        images: [
          '/new-images/Shoes/shoe-5.jpg',
          '/new-images/Shoes/shoe-10.jpg',
          '/new-images/Shoes/shoe-11.jpg',
        ],
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Brown', hex: '#8B4513' },
          { name: 'Tan', hex: '#D2B48C' },
        ],
      },
      // Additional products for completeness
      'dress-6': {
        name: 'Luxury Ball Gown',
        price: 349000,
        originalPrice: 449000,
        discount: 22,
        rating: 4.8,
        reviewCount: 112,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'An exquisite ball gown perfect for formal events and galas. Featuring luxurious fabric, elegant design, and impeccable tailoring for a truly regal appearance.',
        features: [
          'Luxurious fabric',
          'Elegant design',
          'Impeccable tailoring',
          'Perfect for formal events',
          'Regal appearance',
          'Dry clean only',
        ],
        images: ['/new-images/dress/dress-6.jpg', '/new-images/dress/dress-7.jpg', '/new-images/dress/dress-8.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Navy', hex: '#000080' },
          { name: 'Burgundy', hex: '#800020' },
        ],
      },
      'dress-7': {
        name: 'Stylish Casual Dress',
        price: 169000,
        originalPrice: 219000,
        discount: 23,
        rating: 4.5,
        reviewCount: 189,
        category: "Women's Dress",
        brand: 'CaddyComfort',
        description: 'A comfortable and stylish casual dress perfect for everyday wear. Easy to care for and versatile enough to dress up or down for any occasion.',
        features: [
          'Comfortable fit',
          'Everyday wear',
          'Easy care',
          'Versatile styling',
          'Breathable fabric',
          'Machine washable',
        ],
        images: ['/new-images/dress/dress-7.jpg', '/new-images/dress/dress-9.jpg', '/new-images/dress/dress-10.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Blue', hex: '#2563EB' },
          { name: 'Pink', hex: '#EC4899' },
        ],
      },
      'shoe-6': {
        name: 'Designer Pumps',
        price: 179000,
        originalPrice: 239000,
        discount: 25,
        rating: 4.6,
        reviewCount: 203,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Classic designer pumps that never go out of style. These timeless shoes offer comfort and sophistication for any professional or formal setting.',
        features: [
          'Classic design',
          'Professional style',
          'Comfortable fit',
          'Quality materials',
          'Timeless appeal',
          'Durable construction',
        ],
        images: ['/new-images/Shoes/shoe-6.jpg', '/new-images/Shoes/shoe-12.jpg', '/new-images/Shoes/shoe-13.jpg'],
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Nude', hex: '#E3BC9A' },
          { name: 'Navy', hex: '#000080' },
        ],
      },
      'shoe-7': {
        name: 'Elegant Wedge Heels',
        price: 209000,
        originalPrice: 269000,
        discount: 22,
        rating: 4.5,
        reviewCount: 156,
        category: "Women's Shoes",
        brand: 'CaddyComfort',
        description: 'Comfortable yet stylish wedge heels that provide height without compromising on comfort. Perfect for long events where you want to look great and feel comfortable.',
        features: [
          'Wedge design',
          'Comfortable heel',
          'Stable platform',
          'Stylish appearance',
          'Quality materials',
          'All-day comfort',
        ],
        images: ['/new-images/Shoes/shoe-7.jpg', '/new-images/Shoes/shoe-14.jpg', '/new-images/Shoes/shoe-15.jpg'],
        sizes: ['36', '37', '38', '39', '40'],
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Beige', hex: '#F5F5DC' },
          { name: 'Brown', hex: '#8B4513' },
        ],
      },
    };

    // Default product if ID not found
    const defaultProduct: ProductData = {
      name: 'Premium Product',
      price: 199000,
      originalPrice: 259000,
      discount: 23,
      rating: 4.5,
      reviewCount: 100,
      category: "Women's Collection",
      brand: 'CaddyComfort',
      description: 'A premium quality product crafted with attention to detail and superior materials.',
      features: ['Premium quality', 'Durable', 'Stylish design'],
      images: ['/new-images/dress/dress-1.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Black', hex: '#000000' }],
    };

    return productDatabase[productId] || defaultProduct;
  };

  const productData = getProductData(id);
  const product = {
    id,
    ...productData,
    inStock: true,
  };

  // Related products based on category
  interface RelatedProduct {
    id: string;
    title: string;
    category: string;
    price: string;
    originalPrice: string;
    discount: string;
    image: string;
  }

  const getRelatedProducts = (category: string, currentId: string): RelatedProduct[] => {
    const allProducts: Record<string, RelatedProduct[]> = {
      'Handbag': [
        { id: 'bag-1', title: 'Elegant Leather Handbag', category: 'Handbag', price: 'Rwf 159,000', originalPrice: 'Rwf 199,000', discount: '20%', image: '/new-images/bag/bag-1.jpg' },
        { id: 'bag-2', title: 'Designer Tote Bag', category: 'Handbag', price: 'Rwf 179,000', originalPrice: 'Rwf 229,000', discount: '22%', image: '/new-images/bag/bag-2.jpg' },
        { id: 'bag-3', title: 'Luxury Crossbody Bag', category: 'Handbag', price: 'Rwf 139,000', originalPrice: 'Rwf 179,000', discount: '22%', image: '/new-images/bag/bag-3.jpg' },
        { id: 'bag-4', title: 'Premium Shoulder Bag', category: 'Handbag', price: 'Rwf 169,000', originalPrice: 'Rwf 219,000', discount: '23%', image: '/new-images/bag/bag-4.jpg' },
      ],
      "Women's Dress": [
        { id: 'dress-1', title: 'Elegant Evening Gown', category: "Women's Dress", price: 'Rwf 249,000', originalPrice: 'Rwf 329,000', discount: '24%', image: '/new-images/dress/dress-1.jpg' },
        { id: 'dress-2', title: 'Classic A-Line Dress', category: "Women's Dress", price: 'Rwf 189,000', originalPrice: 'Rwf 249,000', discount: '24%', image: '/new-images/dress/dress-2.jpg' },
        { id: 'dress-3', title: 'Designer Cocktail Dress', category: "Women's Dress", price: 'Rwf 279,000', originalPrice: 'Rwf 359,000', discount: '22%', image: '/new-images/dress/dress-3.jpg' },
        { id: 'dress-4', title: 'Elegant Maxi Dress', category: "Women's Dress", price: 'Rwf 219,000', originalPrice: 'Rwf 289,000', discount: '24%', image: '/new-images/dress/dress-4.jpg' },
      ],
      "Women's Shoes": [
        { id: 'shoe-1', title: 'Premium Leather Heels', category: "Women's Shoes", price: 'Rwf 189,000', originalPrice: 'Rwf 249,000', discount: '24%', image: '/new-images/Shoes/shoe-1.jpg' },
        { id: 'shoe-2', title: 'Designer High Heels', category: "Women's Shoes", price: 'Rwf 219,000', originalPrice: 'Rwf 289,000', discount: '24%', image: '/new-images/Shoes/shoe-2.jpg' },
        { id: 'shoe-3', title: 'Elegant Stiletto Heels', category: "Women's Shoes", price: 'Rwf 199,000', originalPrice: 'Rwf 259,000', discount: '23%', image: '/new-images/Shoes/shoe-3.jpg' },
        { id: 'shoe-4', title: 'Luxury Platform Heels', category: "Women's Shoes", price: 'Rwf 229,000', originalPrice: 'Rwf 299,000', discount: '23%', image: '/new-images/Shoes/shoe-4.jpg' },
      ],
      'Wigs': [
        { id: 'wig-1', title: 'Premium Human Hair Wig', category: 'Wigs', price: 'Rwf 349,000', originalPrice: 'Rwf 449,000', discount: '22%', image: '/new-images/wigs/wig-1.jpg' },
        { id: 'wig-2', title: 'Luxury Synthetic Wig', category: 'Wigs', price: 'Rwf 229,000', originalPrice: 'Rwf 299,000', discount: '23%', image: '/new-images/wigs/wig-2.jpg' },
        { id: 'bag-1', title: 'Elegant Leather Handbag', category: 'Handbag', price: 'Rwf 159,000', originalPrice: 'Rwf 199,000', discount: '20%', image: '/new-images/bag/bag-1.jpg' },
        { id: 'dress-1', title: 'Elegant Evening Gown', category: "Women's Dress", price: 'Rwf 249,000', originalPrice: 'Rwf 329,000', discount: '24%', image: '/new-images/dress/dress-1.jpg' },
      ],
    };

    const categoryProducts = allProducts[category] || allProducts["Women's Dress"];
    return categoryProducts.filter(p => p.id !== currentId).slice(0, 4);
  };

  const relatedProducts = getRelatedProducts(product.category, id);

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Absolutely love this sweater! The quality is exceptional and it fits perfectly.',
      verified: true,
    },
    {
      id: 2,
      name: 'Emma L.',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great product, runs slightly large but very comfortable.',
      verified: true,
    },
    {
      id: 3,
      name: 'Jessica K.',
      rating: 5,
      date: '2024-01-05',
      comment: 'The cashmere is incredibly soft. Worth every penny!',
      verified: true,
    },
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });

    toast.success('Added to cart');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover cursor-zoom-in"
                  priority
                />
                {product.discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-accent-rose">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? 'border-accent-rose'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">
                  {product.name}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">{product.brand}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold">Rwf {product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      Rwf {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {product.inStock ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Color: {selectedColor && <span className="text-accent-rose">{selectedColor}</span>}
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color: { name: string; hex: string }) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-accent-rose scale-110'
                          : 'border-gray-300 hover:border-accent-rose'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Size: {selectedSize && <span className="text-accent-rose">{selectedSize}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] ${selectedSize === size ? 'bg-accent-rose hover:bg-accent-rose-dark' : ''}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-accent-rose text-accent-rose' : ''}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Free Shipping</p>
                    <p className="text-muted-foreground">On orders over Rwf 100,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-muted-foreground">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-accent-rose" />
                  <div className="text-sm">
                    <p className="font-semibold">Easy Returns</p>
                    <p className="text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-serif mb-4">Product Details</h3>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                <h4 className="text-lg font-semibold mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent-rose shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-bold">{product.rating}</span>
                      <div>
                        <div className="flex">{renderStars(product.rating)}</div>
                        <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Write a Review</Button>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.name}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">{renderStars(review.rating)}</div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-serif mb-4">Shipping & Returns</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Information</h4>
                    <p className="text-muted-foreground">
                      We offer free standard shipping on all orders over Rwf 100,000. Orders are typically processed
                      within 1-2 business days and delivered within 5-7 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Return Policy</h4>
                    <p className="text-muted-foreground">
                      We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their
                      original condition with all tags attached. Please contact our customer service team to initiate a return.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <div>
            <h2 className="text-3xl font-serif mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product: RelatedProduct) => (
                <ProductCard key={product.id} {...product} href={`/shop/${product.id}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
