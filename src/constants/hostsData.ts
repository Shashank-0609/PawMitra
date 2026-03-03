export interface Host {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  price: number;
  location: string;
  about: string;
  experience: string;
  images: string[];
  amenities: string[];
  reviews: { name: string; rating: number; date: string; comment: string }[];
}

export const HOSTS_DATA: Record<string, Host> = {
  '1': {
    id: '1',
    name: 'Priya Sharma',
    rating: 4.9,
    reviewsCount: 24,
    price: 800,
    location: 'Jubilee Hills, Hyderabad',
    about: "Hi! I'm Priya, a lifelong pet lover and a professional freelance designer. I work from home, which means your furry friend will have constant company and supervision. I live in a spacious independent house with a fully fenced backyard where pets can run and play safely.",
    experience: '5+ years of active pet hosting. Experienced in administering oral medications and handling special dietary needs.',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Fenced Backyard', 'Daily Walks', '24/7 Supervision', 'Oral Medication', 'Vet Nearby', 'Photo Updates'],
    reviews: [
      { name: 'Amit K.', rating: 5, date: '2 weeks ago', comment: 'Priya was amazing with my Golden Retriever. I received daily photos!' },
      { name: 'Sonal M.', rating: 4, date: '1 month ago', comment: 'Very professional and caring.' }
    ]
  },
  '2': {
    id: '2',
    name: 'Rahul Verma',
    rating: 4.8,
    reviewsCount: 18,
    price: 650,
    location: 'Gachibowli, Hyderabad',
    about: "I'm Rahul, a software engineer who loves cats. I have a quiet, pet-proofed apartment and plenty of toys. I've grown up with cats and understand their unique personalities and needs.",
    experience: '3 years of cat sitting and hosting. Specializes in shy or senior cats.',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Cat Trees', 'Premium Litter', 'Quiet Environment', 'Daily Playtime', 'Grooming', 'Photo Updates'],
    reviews: [
      { name: 'Vikram S.', rating: 5, date: '3 weeks ago', comment: 'My cat Luna felt right at home. Rahul is very patient.' }
    ]
  },
  '3': {
    id: '3',
    name: 'Anjali Nair',
    rating: 5.0,
    reviewsCount: 32,
    price: 1200,
    location: 'Banjara Hills, Hyderabad',
    about: "Certified pet behaviorist with a passion for providing premium care. My home is a sanctuary for pets, featuring climate-controlled rooms and a large garden.",
    experience: '8+ years as a professional pet sitter and behaviorist. Expert in large breeds and high-energy dogs.',
    images: [
      'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Climate Control', 'Large Garden', 'Behavioral Training', 'Premium Food', 'Pool for Dogs', '24/7 Supervision'],
    reviews: [
      { name: 'Sneha R.', rating: 5, date: '1 week ago', comment: 'The best hosting experience in Hyderabad. Anjali is a true professional.' }
    ]
  },
  '4': {
    id: '4',
    name: 'Vikram Singh',
    rating: 4.7,
    reviewsCount: 12,
    price: 500,
    location: 'Kukatpally, Hyderabad',
    about: "I'm Vikram, a fitness enthusiast who loves taking dogs on long walks and runs. I have a safe, pet-friendly home and plenty of energy to keep your pets active.",
    experience: '2 years of dog walking and hosting. Best for active breeds.',
    images: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Daily Runs', 'Park Nearby', 'Large Backyard', 'Pet First Aid', 'Flexible Schedule', 'Photo Updates'],
    reviews: [
      { name: 'Rahul P.', rating: 4, date: '1 month ago', comment: 'Vikram is great with active dogs. My Husky loved the runs!' }
    ]
  },
  '5': {
    id: '5',
    name: 'Sneha Reddy',
    rating: 4.9,
    reviewsCount: 15,
    price: 900,
    location: 'Madhapur, Hyderabad',
    about: "I'm Sneha, and I live in a modern, pet-friendly apartment. I've worked with various rescue organizations and have a deep understanding of pet psychology.",
    experience: '4 years of volunteering and hosting. Experienced with rescue and anxious pets.',
    images: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Rescue Experience', 'Calm Environment', 'Premium Treats', 'Daily Grooming', 'Vet on Call', 'Photo Updates'],
    reviews: [
      { name: 'Anjali M.', rating: 5, date: '2 weeks ago', comment: 'Sneha is so gentle. My rescue dog felt very safe with her.' }
    ]
  },
  '6': {
    id: '6',
    name: 'Arjun Das',
    rating: 4.6,
    reviewsCount: 10,
    price: 750,
    location: 'Secunderabad',
    about: "I'm Arjun, and I have a large independent house with a big garden. I love playing fetch and spending time outdoors with dogs.",
    experience: '3 years of hosting large dog breeds. Loves active play.',
    images: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800'
    ],
    amenities: ['Big Garden', 'Fetch Partner', 'Large Breed Friendly', 'Outdoor Play', 'Safe Fencing', 'Photo Updates'],
    reviews: [
      { name: 'Karan T.', rating: 4, date: '3 weeks ago', comment: 'Great place for big dogs. Arjun is very energetic.' }
    ]
  }
};
